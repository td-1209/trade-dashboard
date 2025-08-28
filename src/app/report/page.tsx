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

export default function AnalysisPage() {
  const [cumulativeProfit, setCumulativeProfit] = useState<number>(0);
  const [monthlyProfitData, setMonthlyProfitData] = useState<MonthlyData[]>([]);
  const [monthlyPipsData, setMonthlyPipsData] = useState<MonthlyData[]>([]);
  const [methodAnalysis, setMethodAnalysis] = useState<MethodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const august2025 = '2025-08-01T00:00:00';

      // PLデータとCFデータを取得
      const { data: plData } = await supabase
        .from('pl')
        .select('*')
        .gte('entered_at', august2025)
        .order('entered_at', { ascending: false });

      const { data: cfData } = await supabase
        .from('cf')
        .select('*')
        .gte('executed_at', august2025)
        .order('executed_at', { ascending: false });

      if (plData && cfData) {
        // 累積損益額の計算
        const totalProfit = plData.reduce(
          (sum, record) => sum + (record.profit_loss || 0),
          0
        );
        const totalInvestment = cfData.reduce(
          (sum, record) => sum + (record.price || 0),
          0
        );
        setCumulativeProfit(totalProfit - totalInvestment);

        // 月次データの計算（直近6ヶ月）
        const monthlyProfits = calculateMonthlyData(plData);
        const monthlyPips = calculateMonthlyData(plData);
        setMonthlyProfitData(monthlyProfits);
        setMonthlyPipsData(monthlyPips);

        // 手法別勝率分析（直近3ヶ月）
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const recentPL = plData.filter(
          (record) => new Date(record.entered_at) >= threeMonthsAgo
        );
        const methodStats = calculateMethodAnalysis(recentPL);
        setMethodAnalysis(methodStats);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const calculateMonthlyData = (plData: PL[]): MonthlyData[] => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentData = plData.filter(
      (record) => new Date(record.entered_at) >= sixMonthsAgo
    );
    const monthlyMap = new Map<
      string,
      { profit_loss: number; pips: number; count: number }
    >();

    recentData.forEach((record) => {
      const date = new Date(record.entered_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { profit_loss: 0, pips: 0, count: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.profit_loss += record.profit_loss || 0;

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
        month: parseInt(month.split('-')[1]) + '月',
        profit_loss: data.profit_loss,
        pips: data.pips,
      }))
      .sort((a, b) => {
        const monthA = parseInt(a.month.replace('月', ''));
        const monthB = parseInt(b.month.replace('月', ''));
        return monthA - monthB;
      })
      .slice(-6);
  };

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
      .sort((a, b) => b.win_rate - a.win_rate);
  };

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return `${date.getMonth() + 1}/${date.getDate()}`;
  // };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='text-lightGray'>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 累積損益額 */}
      <Card padding='large'>
        <h2 className='text-xl font-bold text-white mb-2'>累積損益額</h2>
        <p
          className={`text-3xl font-bold ${
            cumulativeProfit >= 0 ? 'text-positive' : 'text-negative'
          }`}
        >
          ¥{cumulativeProfit.toLocaleString()}
        </p>
        <p className='text-lightGray text-sm mt-1'>2025年8月以降</p>
      </Card>

      {/* 月別損益グラフ */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white mb-4'>
          月別損益額（直近6ヶ月）（万円）
        </h3>
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
            <Bar dataKey='profit_loss' fill='#448AFF' name='損益額（¥）' />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 月別pipsグラフ */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white mb-4'>
          月別pips（直近6ヶ月）
        </h3>
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
        <h3 className='text-lg font-bold text-white'>
          手法別勝率（直近3ヶ月）
        </h3>
        {methodAnalysis.map((method, index) => (
          <Card key={index} padding='large'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='text-white font-bold'>{method.method}</h4>
              <span
                className={`text-xl font-bold ${
                  method.win_rate >= 50 ? 'text-positive' : 'text-negative'
                }`}
              >
                {method.win_rate}%
              </span>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              {/* 成功例 */}
              <div>
                <h5 className='text-positive font-semibold mb-2'>成功例</h5>
                {method.success_cases.map((record, idx) => (
                  <div key={idx} className='bg-black rounded p-3 mb-2 text-sm'>
                    <div className='text-lightGray'>{record.reason_detail}</div>
                    {/* <div className='text-white'>
                      {record.base_currency}/{record.quote_currency} (
                      {record.position})
                    </div>
                    <div className='text-lightGray'>
                      {formatDate(record.entered_at)} →{' '}
                      {record.exited_at
                        ? formatDate(record.exited_at)
                        : '取引中'}
                    </div>
                    <div className='text-lightGray'>
                      {record.entry} → {record.exit || 'N/A'}
                    </div>
                    {record.exit && record.entry && (
                      <div className='text-positive'>
                        {calculatePips({
                          quoteCurrency: record.quote_currency || 'USD',
                          entryPrice: record.entry,
                          exitPrice: record.exit,
                          position: record.position,
                        })}{' '}
                        pips
                      </div>
                    )} */}
                    {record.result_image &&
                      record.result_image !== 'unknown' && (
                        <div className='mt-2'>
                          <Image
                            src={record.result_image}
                            alt='結果画像'
                            width={150}
                            height={100}
                            className='rounded border border-darkGray'
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* 失敗例 */}
              <div>
                <h5 className='text-negative font-semibold mb-2'>失敗例</h5>
                {method.failure_cases.map((record, idx) => (
                  <div key={idx} className='bg-black rounded p-3 mb-2 text-sm'>
                    <div className='text-lightGray'>{record.reason_detail}</div>
                    {/* <div className='text-white'>
                      {record.base_currency}/{record.quote_currency} (
                      {record.position})
                    </div>
                    <div className='text-lightGray'>
                      {formatDate(record.entered_at)} →{' '}
                      {record.exited_at
                        ? formatDate(record.exited_at)
                        : '取引中'}
                    </div>
                    <div className='text-lightGray'>
                      {record.entry} → {record.exit || 'N/A'}
                    </div>
                    <div className='text-lightGray'>
                      TP: {record.take_profit} / LC: {record.loss_cut}
                    </div>
                    {record.exit && record.entry && (
                      <div className='text-negative'>
                        {calculatePips({
                          quoteCurrency: record.quote_currency || 'USD',
                          entryPrice: record.entry,
                          exitPrice: record.exit,
                          position: record.position,
                        })}{' '}
                        pips
                      </div>
                    )} */}
                    {record.result_image &&
                      record.result_image !== 'unknown' && (
                        <div className='mt-2'>
                          <Image
                            src={record.result_image}
                            alt='結果画像'
                            width={150}
                            height={100}
                            className='rounded border border-darkGray'
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      )}
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
