/* eslint-disable no-irregular-whitespace */
'use client';

import { useEffect, useState } from 'react';
import { PlRecord, Item } from '@/types/type';
import { calculatePips } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems } from '@/lib/dynamodb';

interface DisplayRecord extends Record<string, Item> {
  month: string;
  totalPrice: number;
  totalPips: number;
  winRate: number;
}

const initialDisplayRecords: DisplayRecord[] = [{
  month: '',
  totalPrice: 0,
  totalPips: 0,
  winRate: 0,
}];

export const ResultCard = () => {
  const [displayRecords, setDisplayRecords] = useState<DisplayRecord[]>(initialDisplayRecords);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const [newRecords] = await Promise.all([
        fetchGETRequestItems<PlRecord>({ endpoint: '/api/pl/read-all-items' }),
      ]);
      if (newRecords) {
        // データの加工
        const sortedRecords = sortItems<PlRecord>({ items: newRecords, keyName: 'id', type: 'DSC'});
        const formattedDisplayRecords = sortedRecords.map(record => ({
          id: record.id,
          enteredAt: record.enteredAt,
          exitedAt: record.exitedAt,
          baseCurrency: record.baseCurrency,
          quoteCurrency: record.quoteCurrency,
          profitLossPrice: Number(record.profitLossPrice),
          profitLossPips: calculatePips({
            quoteCurrency: record.quoteCurrency,
            entryPrice: record.entryPrice,
            exitPrice: record.exitPrice,
            position: record.position
          }),
          isSettled: record.isSettled,
          reason: record.reason,
          result: record.result,
        }));

        // 決済済みのレコードのみを抽出
        const settledRecords = formattedDisplayRecords.filter(record => record.isSettled);

        // 月次情報のマップを定義
        const monthlyStats = new Map<string, {
          totalPrice: number;
          totalPips: number;
          positivePipsCount: number;
          totalCount: number;
        }>();

        // レコードごとに集計
        settledRecords.forEach(record => {
          const month = record.enteredAt.split('-').slice(0, 2).join('-');
          const stats = monthlyStats.get(month) || {
            totalPrice: 0,
            totalPips: 0,
            positivePipsCount: 0,
            totalCount: 0
          };
          stats.totalPrice += record.profitLossPrice;
          stats.totalPips += record.profitLossPips;
          if (record.profitLossPips > 0) {
            stats.positivePipsCount++;
          }
          stats.totalCount++;
          monthlyStats.set(month, stats);
        });

        // 集計結果を加工
        const monthlyAnalytics = Array.from(monthlyStats.entries()).map(([month, stats]) => ({
          month,
          totalPrice: stats.totalPrice,
          totalPips: parseFloat(stats.totalPips.toFixed(4)),
          winRate: parseFloat((stats.positivePipsCount / stats.totalCount).toFixed(4))
        }));
        monthlyAnalytics.sort((a, b) => b.month.localeCompare(a.month));

        // 情報を記録
        setDisplayRecords(monthlyAnalytics);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 px-4 gap-4'>
        {[...Array(10)].map((_, index) => (
          <ItemLoading key={index} />
        ))}
      </div>
    );
  } else {
    return (
      <div className='grid grid-cols-1 px-4 gap-4'>
        {displayRecords.map((item, index) => (
          <div key={index} className='bg-darkGray rounded-lg px-5 py-3 w-full h-full'>
            <p className='text-xl text-lightGray'>{ item.month }</p>
            <p className={`${ item.totalPips >= 0 ? 'text-positive' : 'text-negative' }`}>{ item.totalPips }pips</p>
            <p className={`${ item.totalPrice >= 0 ? 'text-positive' : 'text-negative' }`}>{ item.totalPrice }円</p>
            <p className={`${ item.winRate >= 0.3 ? 'text-positive' : 'text-negative' }`}>{ item.winRate * 100 }%</p>
          </div>
        ))}
      </div>
    );
  }
};

const ItemLoading = () => {
  return(
    <></>
  );
};