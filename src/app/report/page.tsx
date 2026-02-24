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
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface MonthlyData {
  month: string;
  value: number;
}

interface DefeatBarData {
  days: number;
  profit_loss: number;
}

interface DefeatWinLossData {
  days: number;
  wins: number;
  losses: number;
}

interface DefeatScatterData {
  pips: number;
  profit_loss: number;
  isLoss: boolean;
}

interface MethodAnalysis {
  method: string;
  win_rate: number;
  total_pips: number;
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

// 手法分析の表示サンプル数（成功例・失敗例それぞれ）
const METHOD_ANALYSIS_SAMPLE_COUNT = 3;

// 共通Tooltipスタイル
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#333333',
    border: 'none',
    borderRadius: '8px',
  },
  labelStyle: { color: '#ECEFF1' },
};

// 共通Y軸スタイル
const yAxisProps = {
  stroke: '#757575',
  orientation: 'left' as const,
  axisLine: false,
  tickLine: false,
  tick: { dx: -15 },
};

// Date → "YYYY/MM"
const toMonthKey = (date: Date): string => {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// 全月の範囲を生成（最小月〜現在月）
const generateMonthRange = (months: string[]): string[] => {
  if (months.length === 0) return [];
  const sorted = [...months].sort();
  const [startYear, startMonth] = sorted[0].split('/').map(Number);
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;
  const result: string[] = [];
  let y = startYear,
    m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    result.push(`${y}/${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return result;
};

// Y軸を0中心で対称にするためのdomain計算
const symmetricDomain = (values: number[]): [number, number] => {
  const maxAbs = Math.max(...values.map(Math.abs), 0);
  return [-maxAbs, maxAbs];
};

// 折れ線グラデーションの0地点オフセットを計算（パスのbounding box基準）
const gradientOffset = (data: { value: number }[]): number => {
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max <= 0) return 0;
  if (min >= 0) return 1;
  return max / (max - min);
};

// Map → MonthlyData[] に変換（欠損月は0埋め）
const fillMonths = (
  monthlyMap: Map<string, number>,
  allMonths: string[]
): MonthlyData[] => {
  return allMonths.map((month) => ({
    month,
    value: monthlyMap.get(month) || 0,
  }));
};

// 累積値に変換
const toCumulative = (data: MonthlyData[]): MonthlyData[] => {
  let cumulative = 0;
  return data.map((d) => {
    cumulative += d.value;
    return { month: d.month, value: cumulative };
  });
};

export default function AnalysisPage() {
  const [cumulativePLData, setCumulativePLData] = useState<MonthlyData[]>([]);
  const [monthlyPLData, setMonthlyPLData] = useState<MonthlyData[]>([]);
  const [monthlyPipsData, setMonthlyPipsData] = useState<MonthlyData[]>([]);
  const [cumulativeCapitalData, setCumulativeCapitalData] = useState<
    MonthlyData[]
  >([]);
  const [defeatBarData, setDefeatBarData] = useState<DefeatBarData[]>([]);
  const [defeatWinLossData, setDefeatWinLossData] = useState<
    DefeatWinLossData[]
  >([]);
  const [defeatScatterData, setDefeatScatterData] = useState<
    DefeatScatterData[]
  >([]);
  const [methodAnalysis, setMethodAnalysis] = useState<MethodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: plData } = await supabase
        .from('pl')
        .select('*')
        .order('entered_at', { ascending: false });

      const { data: cfData } = await supabase
        .from('cf')
        .select('*')
        .order('executed_at', { ascending: false });

      if (plData && cfData) {
        const completedPL = plData.filter((r) => r.profit_loss !== null);

        // 全データソースから月を収集し、統一X軸を生成
        const allMonthsSet = new Set<string>();
        plData.forEach((r) =>
          allMonthsSet.add(toMonthKey(new Date(r.entered_at)))
        );
        cfData.forEach((r) =>
          allMonthsSet.add(toMonthKey(new Date(r.executed_at)))
        );
        const allMonths = generateMonthRange(Array.from(allMonthsSet));

        // --- 最終結果 ---

        // 月毎損益
        const plMap = new Map<string, number>();
        completedPL.forEach((r) => {
          const key = toMonthKey(new Date(r.entered_at));
          plMap.set(key, (plMap.get(key) || 0) + (r.profit_loss || 0));
        });
        const monthlyPL = fillMonths(plMap, allMonths);
        setMonthlyPLData(monthlyPL);

        // 累積損益
        setCumulativePLData(toCumulative(monthlyPL));

        // 月毎pips（FXのみ）
        const pipsMap = new Map<string, number>();
        completedPL
          .filter((r) => r.domain === 'fx' && r.entry && r.exit)
          .forEach((r) => {
            const key = toMonthKey(new Date(r.entered_at));
            const pips = calculatePips({
              quoteCurrency: r.quote_currency || 'USD',
              entryPrice: r.entry,
              exitPrice: r.exit!,
              position: r.position,
            });
            pipsMap.set(key, (pipsMap.get(key) || 0) + pips);
          });
        setMonthlyPipsData(fillMonths(pipsMap, allMonths));

        // 累積資本状況（投資額はマイナス表示）
        const investMap = new Map<string, number>();
        cfData.forEach((r) => {
          const key = toMonthKey(new Date(r.executed_at));
          investMap.set(
            key,
            (investMap.get(key) || 0) + (r.price || 0) * -1
          );
        });
        setCumulativeCapitalData(
          toCumulative(fillMonths(investMap, allMonths))
        );

        // --- 敗北分析 ---
        const closedTrades = completedPL.filter((r) => r.exited_at);

        // 棒グラフ: 取引日数 vs 損益（日数ごとに合算、1〜最大日数の連番）
        const daysMap = new Map<number, number>();
        closedTrades.forEach((r) => {
          const entered = new Date(r.entered_at);
          const exited = new Date(r.exited_at!);
          const days = Math.max(
            1,
            Math.round(
              (exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
            )
          );
          daysMap.set(days, (daysMap.get(days) || 0) + (r.profit_loss || 0));
        });
        const maxDays = Math.max(...Array.from(daysMap.keys()), 1);
        const barData: DefeatBarData[] = Array.from(
          { length: maxDays },
          (_, i) => ({
            days: i + 1,
            profit_loss: daysMap.get(i + 1) || 0,
          })
        );
        setDefeatBarData(barData);

        // 棒グラフ: 取引日数 vs 勝敗数（勝ち数は上、負け数は下）
        const winsMap = new Map<number, number>();
        const lossesMap = new Map<number, number>();
        closedTrades.forEach((r) => {
          const entered = new Date(r.entered_at);
          const exited = new Date(r.exited_at!);
          const days = Math.max(
            1,
            Math.round(
              (exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
            )
          );
          if ((r.profit_loss || 0) >= 0) {
            winsMap.set(days, (winsMap.get(days) || 0) + 1);
          } else {
            lossesMap.set(days, (lossesMap.get(days) || 0) - 1);
          }
        });
        const winLossData: DefeatWinLossData[] = Array.from(
          { length: maxDays },
          (_, i) => ({
            days: i + 1,
            wins: winsMap.get(i + 1) || 0,
            losses: lossesMap.get(i + 1) || 0,
          })
        );
        setDefeatWinLossData(winLossData);

        // 散布図: pips vs 損益（FXのみ）
        const scatterData: DefeatScatterData[] = closedTrades
          .filter((r) => r.domain === 'fx' && r.entry && r.exit)
          .map((r) => {
            const pips = calculatePips({
              quoteCurrency: r.quote_currency || 'USD',
              entryPrice: r.entry,
              exitPrice: r.exit!,
              position: r.position,
            });
            const pl = r.profit_loss || 0;
            return {
              pips: Math.abs(Math.round(pips * 10) / 10),
              profit_loss: Math.abs(pl),
              isLoss: pl < 0,
            };
          });
        setDefeatScatterData(scatterData);

        // --- 手法分析 ---
        // 2025/9/16以降の全データ
        const targetDate = new Date('2025-09-16');
        const recentPL = plData.filter(
          (r) =>
            new Date(r.entered_at) >= targetDate &&
            r.profit_loss != null
        );
        setMethodAnalysis(calculateMethodAnalysis(recentPL));
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // 手法別分析データを整形
  const calculateMethodAnalysis = (plData: PL[]): MethodAnalysis[] => {
    const methodMap = new Map<
      string,
      { wins: number; total: number; totalPips: number; records: PL[] }
    >();
    plData.forEach((record) => {
      if (!methodMap.has(record.method)) {
        methodMap.set(record.method, {
          wins: 0,
          total: 0,
          totalPips: 0,
          records: [],
        });
      }
      const methodData = methodMap.get(record.method)!;
      methodData.total++;
      methodData.records.push(record);
      if ((record.profit_loss || 0) >= 0) {
        methodData.wins++;
      }
      if (record.domain === 'fx' && record.entry && record.exit) {
        const pips = calculatePips({
          quoteCurrency: record.quote_currency || 'USD',
          entryPrice: record.entry,
          exitPrice: record.exit,
          position: record.position,
        });
        methodData.totalPips += pips;
      }
    });
    return Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method:
          methodOptions.find((opt) => opt.value === method)?.label || method,
        win_rate: Math.round((data.wins / data.total) * 100),
        total_pips: Math.round(data.totalPips * 10) / 10,
        success_cases: data.records
          .filter((r) => (r.profit_loss || 0) >= 0)
          .sort(
            (a, b) =>
              new Date(b.entered_at).getTime() -
              new Date(a.entered_at).getTime()
          )
          .slice(0, METHOD_ANALYSIS_SAMPLE_COUNT),
        failure_cases: data.records
          .filter((r) => (r.profit_loss || 0) < 0)
          .sort(
            (a, b) =>
              new Date(b.entered_at).getTime() -
              new Date(a.entered_at).getTime()
          )
          .slice(0, METHOD_ANALYSIS_SAMPLE_COUNT),
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
      {/* ===== 最終結果 ===== */}
      <h2 className='text-xl font-bold text-white my-2'>最終結果</h2>

      {/* 累積損益 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>累積損益（万円）</h3>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={cumulativePLData}>
            <defs>
              <linearGradient id='lineColorPL' x1='0' y1='0' x2='0' y2='1'>
                <stop offset={gradientOffset(cumulativePLData)} stopColor='#4CAF50' />
                <stop offset={gradientOffset(cumulativePLData)} stopColor='#FF5252' />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis dataKey='month' stroke='#757575' />
            <YAxis
              {...yAxisProps}
              domain={symmetricDomain(cumulativePLData.map((d) => d.value))}
              tickFormatter={(value) => `${(value / 10000).toFixed(1)}`}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number) => [
                `${value.toLocaleString()}円`,
                '累積損益',
              ]}
            />
            <Line
              type='linear'
              dataKey='value'
              stroke='url(#lineColorPL)'
              strokeWidth={2}
              dot={false}
              name='累積損益'
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 累積資本状況 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>
          累積資本状況（万円）
        </h3>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={cumulativeCapitalData}>
            <defs>
              <linearGradient
                id='lineColorCapital'
                x1='0'
                y1='0'
                x2='0'
                y2='1'
              >
                <stop offset={gradientOffset(cumulativeCapitalData)} stopColor='#4CAF50' />
                <stop offset={gradientOffset(cumulativeCapitalData)} stopColor='#FF5252' />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis dataKey='month' stroke='#757575' />
            <YAxis
              {...yAxisProps}
              domain={symmetricDomain(cumulativeCapitalData.map((d) => d.value))}
              tickFormatter={(value) => `${(value / 10000).toFixed(1)}`}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number) => [
                `${value.toLocaleString()}円`,
                '累積資本',
              ]}
            />
            <Line
              type='linear'
              dataKey='value'
              stroke='url(#lineColorCapital)'
              strokeWidth={2}
              dot={false}
              name='累積資本'
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 月毎損益 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>月毎損益（万円）</h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={monthlyPLData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis dataKey='month' stroke='#757575' />
            <YAxis
              {...yAxisProps}
              domain={symmetricDomain(monthlyPLData.map((d) => d.value))}
              tickFormatter={(value) => `${(value / 10000).toFixed(1)}`}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number) => [
                `${value.toLocaleString()}円`,
                '損益',
              ]}
            />
            <Bar dataKey='value' name='損益'>
              {monthlyPLData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 0 ? '#4CAF50' : '#FF5252'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 月毎pips */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>月毎pips（FX）</h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={monthlyPipsData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis dataKey='month' stroke='#757575' />
            <YAxis
              {...yAxisProps}
              domain={symmetricDomain(monthlyPipsData.map((d) => d.value))}
              tickFormatter={(value) => `${Math.round(value)}`}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number) => [
                `${(Math.round(value * 10) / 10).toFixed(1)} pips`,
                'pips',
              ]}
            />
            <Bar dataKey='value' name='pips'>
              {monthlyPipsData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 0 ? '#4CAF50' : '#FF5252'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ===== 敗北分析 ===== */}
      <h2 className='text-xl font-bold text-white my-2'>敗北分析</h2>

      {/* 取引日数 vs 損益 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>
          取引日数と損益（万円）
        </h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={defeatBarData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis
              dataKey='days'
              stroke='#757575'
              label={{
                value: '日',
                position: 'insideBottomRight',
                offset: -5,
                fill: '#757575',
              }}
            />
            <YAxis
              {...yAxisProps}
              domain={symmetricDomain(defeatBarData.map((d) => d.profit_loss))}
              tickFormatter={(value) => `${(value / 10000).toFixed(1)}`}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const data = payload[0].payload as DefeatBarData;
                return (
                  <div
                    style={{
                      backgroundColor: '#333333',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  >
                    <p
                      style={{ color: '#ECEFF1' }}
                    >{`取引日数: ${data.days}日`}</p>
                    <p
                      style={{ color: '#ECEFF1' }}
                    >{`損益: ${data.profit_loss.toLocaleString()}円`}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey='profit_loss' name='損益'>
              {defeatBarData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.profit_loss >= 0 ? '#4CAF50' : '#FF5252'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 取引日数 vs 勝敗数 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>
          取引日数と勝敗数
        </h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={defeatWinLossData} stackOffset='sign'>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis
              dataKey='days'
              stroke='#757575'
              label={{
                value: '日',
                position: 'insideBottomRight',
                offset: -5,
                fill: '#757575',
              }}
            />
            <YAxis
              {...yAxisProps}
              domain={symmetricDomain(
                defeatWinLossData.flatMap((d) => [d.wins, d.losses])
              )}
              tickFormatter={(value) => `${Math.round(value)}`}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const data = payload[0].payload as DefeatWinLossData;
                return (
                  <div
                    style={{
                      backgroundColor: '#333333',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  >
                    <p
                      style={{ color: '#ECEFF1' }}
                    >{`取引日数: ${data.days}日`}</p>
                    <p
                      style={{ color: '#4CAF50' }}
                    >{`勝ち: ${data.wins}`}</p>
                    <p
                      style={{ color: '#FF5252' }}
                    >{`負け: ${Math.abs(data.losses)}`}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey='wins'
              stackId='a'
              fill='#4CAF50'
              name='勝ち'
            />
            <Bar
              dataKey='losses'
              stackId='a'
              fill='#FF5252'
              name='負け'
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* pips vs 損益 散布図 */}
      <Card padding='large'>
        <h3 className='text-lg font-bold text-white my-2'>
          pipsと損益（FX、万円）
        </h3>
        <ResponsiveContainer width='100%' height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray='3 3' stroke='#333333' />
            <XAxis
              type='number'
              dataKey='pips'
              name='pips'
              stroke='#757575'
              label={{
                value: 'pips',
                position: 'insideBottomRight',
                offset: -5,
                fill: '#757575',
              }}
            />
            <YAxis
              type='number'
              dataKey='profit_loss'
              name='損益'
              {...yAxisProps}
              tickFormatter={(value) => `${(value / 10000).toFixed(1)}`}
            />
            <ReferenceLine y={0} stroke='#FF0000' strokeDasharray='2 2' />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const data = payload[0].payload as DefeatScatterData;
                return (
                  <div
                    style={{
                      backgroundColor: '#333333',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  >
                    <p
                      style={{ color: '#ECEFF1' }}
                    >{`pips: ${data.pips}`}</p>
                    <p
                      style={{ color: '#ECEFF1' }}
                    >{`損益: ${data.profit_loss.toLocaleString()}円`}</p>
                  </div>
                );
              }}
            />
            <Scatter data={defeatScatterData}>
              {defeatScatterData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isLoss ? '#FF5252' : '#4CAF50'}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* ===== 手法分析 ===== */}
      <h2 className='text-xl font-bold text-white my-2'>手法分析</h2>

      <div className='space-y-4'>
        {methodAnalysis.map((method, index) => (
          <Card key={index} padding='large'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='text-lg font-bold text-white my-2'>
                {method.method}
              </h4>
              <span
                className={`font-semibold ${
                  method.total_pips >= 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                {method.total_pips.toFixed(1)} pips ({method.win_rate}%)
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
