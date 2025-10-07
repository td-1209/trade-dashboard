'use client';

import { Card } from '@/components/Card';
import { calculatePips } from '@/lib/calc';
import { createClient } from '@/lib/supabase/client';
import { methodOptions, PL } from '@/types/type';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface MonthlyData {
  month: string;
  profit_loss: number;
  pips: number;
}

interface MethodAnalysis {
  method: string;
  win_rate: number;
  success_cases: PL[];
  failure_cases: PL[];
}

// 日本語の手法名を英語の値にマッピング
const getMethodValue = (methodName: string) => {
  const option = methodOptions.find(
    (opt) => opt.label === methodName && opt.value !== 'unknown'
  );
  return option?.value;
};

export default function AnalysisPage() {
  const [cumulativeProfit, setCumulativeProfit] = useState<number>(0);
  const [monthlyProfitData, setMonthlyProfitData] = useState<MonthlyData[]>([]);
  const [monthlyPipsData, setMonthlyPipsData] = useState<MonthlyData[]>([]);
  const [methodAnalysis, setMethodAnalysis] = useState<MethodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // PLデータとCFデータを取得
      const { data: plData } = await supabase
        .from('pl')
        .select('*')
        .order('entered_at', { ascending: false });

      const { data: cfData } = await supabase
        .from('cf')
        .select('*')
        .order('executed_at', { ascending: false });

      if (plData && cfData) {
        // 累積損益額の計算（累積損益 = 損益 - 元本）
        const totalProfit = plData.reduce(
          (sum, record) => sum + (record.profit_loss || 0),
          0
        );
        const totalInvestment = cfData.reduce(
          (sum, record) => sum + (record.price || 0),
          0
        );
        setCumulativeProfit(totalProfit - totalInvestment);

        // 損益推移の計算（旧月次損益）
        const monthlyProfits = calculateMonthlyData(plData);
        setMonthlyProfitData(monthlyProfits);

        // pips推移の計算（旧月次pips）
        const completedPlData = plData.filter(
          (record) => record.profit_loss !== null
        );
        const monthlyPips = calculateMonthlyPipsData(completedPlData); // FX取引のみ
        setMonthlyPipsData(monthlyPips);

        // 手法別勝率分析
        // 絞り込み条件：2025/9/16以降 かつ 直近3ヶ月
        const targetDate = new Date('2025-09-16');
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const filterDate =
          targetDate > threeMonthsAgo ? targetDate : threeMonthsAgo;
        // 絞り込み条件：methodがunkownでない かつ profit_lossがnullでない
        const recentPL = plData.filter(
          (record) =>
            new Date(record.entered_at) >= filterDate &&
            record.method !== 'unknown' &&
            record.profit_loss != null
        );
        // 分析用データに整形
        const methodStats = calculateMethodAnalysis(recentPL);
        setMethodAnalysis(methodStats);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // 月次損益を計算
  const calculateMonthlyData = (plData: PL[]): MonthlyData[] => {
    const recentData = plData;
    const monthlyMap = new Map<
      string,
      { profit_loss: number; count: number }
    >();
    recentData.forEach((record) => {
      const date = new Date(record.entered_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { profit_loss: 0, count: 0 });
      }
      const monthData = monthlyMap.get(monthKey)!;
      monthData.profit_loss += record.profit_loss || 0;
      monthData.count++;
    });
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: `${month.split('-')[0]}/${month.split('-')[1]}`, // YYYY/MM形式
        profit_loss: data.profit_loss,
        pips: 0, // pipsは別関数で計算
      }))
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split('/').map(Number);
        const [yearB, monthB] = b.month.split('/').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      });
  };

  // 月次pipsを計算
  const calculateMonthlyPipsData = (plData: PL[]): MonthlyData[] => {
    const fxData = plData.filter(
      (record) => record.domain === 'fx' // スケール調整のため外貨のみ対象
    );
    const monthlyMap = new Map<string, { pips: number; count: number }>();
    fxData.forEach((record) => {
      const date = new Date(record.entered_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { pips: 0, count: 0 });
      }
      const monthData = monthlyMap.get(monthKey)!;
      if (record.exit && record.entry) {
        const pips = calculatePips({
          quoteCurrency: record.quote_currency || 'USD',
          entryPrice: record.entry,
          exitPrice: record.exit,
          position: record.position,
        });
        monthData.pips += pips;
      }
      monthData.count++;
    });
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: `${month.split('-')[0]}/${month.split('-')[1]}`, // YYYY/MM形式
        profit_loss: 0, // pipsデータなので0
        pips: data.pips,
      }))
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split('/').map(Number);
        const [yearB, monthB] = b.month.split('/').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      });
  };

  // 分析データ用に整形
  const calculateMethodAnalysis = (plData: PL[]): MethodAnalysis[] => {
    const methodMap = new Map<
      string,
      { wins: number; total: number; records: PL[] }
    >();
    plData.forEach((record) => {
      if (!methodMap.has(record.method)) {
        methodMap.set(record.method, { wins: 0, total: 0, records: [] });
      }
      const methodData = methodMap.get(record.method)!;
      methodData.total++;
      methodData.records.push(record);
      if ((record.profit_loss || 0) >= 0) {
        methodData.wins++;
      }
    });
    return Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method:
          methodOptions.find((opt) => opt.value === method)?.label || method,
        win_rate: Math.round((data.wins / data.total) * 100),
        success_cases: data.records
          .filter((r) => (r.profit_loss || 0) >= 0)
          .sort(
            (a, b) =>
              new Date(b.entered_at).getTime() -
              new Date(a.entered_at).getTime()
          )
          .slice(0, 3),
        failure_cases: data.records
          .filter((r) => (r.profit_loss || 0) < 0)
          .sort(
            (a, b) =>
              new Date(b.entered_at).getTime() -
              new Date(a.entered_at).getTime()
          )
          .slice(0, 3),
      }))
      .sort((a, b) => {
        const aMethodValue = getMethodValue(a.method);
        const bMethodValue = getMethodValue(b.method);
        const aIndex = methodOptions.findIndex(
          (option) => option.value === aMethodValue
        );
        const bIndex = methodOptions.findIndex(
          (option) => option.value === bMethodValue
        );
        return aIndex - bIndex;
      });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='text-lightGray'>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-bold text-white my-2'>成果の部</h2>

      {/* 累積損益 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>累積損益（円）</h3>
        <p
          className={`text-3xl font-bold ${
            cumulativeProfit >= 0 ? 'text-positive' : 'text-negative'
          }`}
        >
          {cumulativeProfit.toLocaleString()}
        </p>
      </Card>

      {/* 損益推移 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>損益推移（万円）</h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={monthlyProfitData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis dataKey='month' stroke='#757575' />
            <YAxis
              stroke='#757575'
              orientation='left'
              tickFormatter={(value) => `${(value / 10000).toFixed(1)}`}
              axisLine={false}
              tickLine={false}
              tick={{ dx: -15 }}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              contentStyle={{
                backgroundColor: '#333333',
                border: 'none',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#ECEFF1' }}
            />
            <Bar dataKey='profit_loss' fill='#448AFF' name='損益(¥)' />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <h2 className='text-xl font-bold text-white my-2'>分析の部</h2>

      {/* pips推移 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>pips推移（FX）</h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={monthlyPipsData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis dataKey='month' stroke='#757575' />
            <YAxis
              stroke='#757575'
              orientation='left'
              tickFormatter={(value) => `${Math.round(value)}`}
              axisLine={false}
              tickLine={false}
              tick={{ dx: -15 }}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              contentStyle={{
                backgroundColor: '#333333',
                border: 'none',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#ECEFF1' }}
            />
            <Bar dataKey='pips' fill='#B39DDB' name='pips' />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 手法別勝率分析 */}
      <div className='space-y-4'>
        {methodAnalysis.map((method, index) => (
          <Card key={index} padding='large'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='text-lg font-bold text-white my-2'>
                {method.method}
              </h4>
              <span
                className={`text-xl font-bold ${
                  method.win_rate > 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                {method.win_rate}%
              </span>
            </div>
            <div className='space-y-6'>
              {/* 成功例 */}
              <div>
                <h5 className='text-positive font-semibold mb-3'>成功例</h5>
                {method.success_cases.map((record, idx) => (
                  <div key={idx} className='bg-black rounded p-4 mb-3'>
                    <h6 className='text-white font-medium mb-2'>
                      {new Date(record.entered_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </h6>
                    <div className='grid grid-cols-2 gap-4'>
                      {/* Reason */}
                      <div className='flex flex-col justify-between'>
                        <div>
                          <h6 className='text-white font-medium mb-2'>理由</h6>
                          <div className='text-lightGray text-sm mb-2'>
                            {record.reason_detail}
                          </div>
                        </div>
                        {record.reason_image &&
                          record.reason_image !== 'unknown' && (
                            <Image
                              src={record.reason_image}
                              alt='理由画像'
                              width={150}
                              height={100}
                              className='rounded border border-darkGray mt-auto'
                              style={{ objectFit: 'contain' }}
                            />
                          )}
                      </div>
                      {/* Result */}
                      <div className='flex flex-col justify-between'>
                        <div>
                          <h6 className='text-white font-medium mb-2'>結果</h6>
                          <div className='text-lightGray text-sm mb-2'>
                            {record.result_detail}
                          </div>
                        </div>
                        {record.result_image &&
                          record.result_image !== 'unknown' && (
                            <Image
                              src={record.result_image}
                              alt='結果画像'
                              width={150}
                              height={100}
                              className='rounded border border-darkGray mt-auto'
                              style={{ objectFit: 'contain' }}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* 失敗例 */}
              <div>
                <h5 className='text-negative font-semibold mb-3'>失敗例</h5>
                {method.failure_cases.map((record, idx) => (
                  <div key={idx} className='bg-black rounded p-4 mb-3'>
                    <h6 className='text-white font-medium mb-2'>
                      {new Date(record.entered_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </h6>
                    <div className='grid grid-cols-2 gap-4'>
                      {/* Reason */}
                      <div className='flex flex-col justify-between'>
                        <div>
                          <h6 className='text-white font-medium mb-2'>理由</h6>
                          <div className='text-lightGray text-sm mb-2'>
                            {record.reason_detail}
                          </div>
                        </div>
                        {record.reason_image &&
                          record.reason_image !== 'unknown' && (
                            <Image
                              src={record.reason_image}
                              alt='理由画像'
                              width={150}
                              height={100}
                              className='rounded border border-darkGray mt-auto'
                              style={{ objectFit: 'contain' }}
                            />
                          )}
                      </div>
                      {/* Result */}
                      <div className='flex flex-col justify-between'>
                        <div>
                          <h6 className='text-white font-medium mb-2'>結果</h6>
                          <div className='text-lightGray text-sm mb-2'>
                            {record.result_detail}
                          </div>
                        </div>
                        {record.result_image &&
                          record.result_image !== 'unknown' && (
                            <Image
                              src={record.result_image}
                              alt='結果画像'
                              width={150}
                              height={100}
                              className='rounded border border-darkGray mt-auto'
                              style={{ objectFit: 'contain' }}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
