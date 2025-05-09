/* eslint-disable no-irregular-whitespace */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlRecord, Item, Currencies, Strategy } from '@/types/type';
import { calculatePips, convertDateTimeDisplayFormat } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems } from '@/lib/dynamodb';

interface DisplayRecord extends Record<string, Item> {
  id: string;
  enteredAt: string;
  exitedAt: string;
  baseCurrency: Currencies;
  quoteCurrency: Currencies;
  profitLossPips: number;
  isSettled: boolean;
  reason: string;
  result: string;
}

const initialDisplayRecords: DisplayRecord[] = [{
  id: '',
  enteredAt: '',
  exitedAt: '',
  baseCurrency: 'USD',
  quoteCurrency: 'JPY',
  profitLossPips: 0,
  isSettled: false,
  reason: '',
  result: '',
}];

const initialLatestStrategy: Strategy = {
  id: '',
  memo: '',
  result: '',
  retrospective: '',
  strategy: '',
  week: '',
};

export const RecordCards = () => {
  const [displayRecords, setDisplayRecords] = useState<DisplayRecord[]>(initialDisplayRecords);
  const [latestStrategy, setLatestStrategy] = useState<Strategy>(initialLatestStrategy);
  
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const [newRecords, newStrategies] = await Promise.all([
        fetchGETRequestItems<PlRecord>({ endpoint: '/api/pl/read-all-items' }),
        fetchGETRequestItems<Strategy>({ endpoint: '/api/strategy/read-all-items' })
      ]);

      // トレード記録取得
      if (newRecords) {
        const sortedRecords = sortItems<PlRecord>({ items: newRecords, keyName: 'id', type: 'DSC'});
        const formattedPlRecords = sortedRecords.map(item => ({
          ...item,
          enteredAt: convertDateTimeDisplayFormat({ dateTime: item.enteredAt }),
          exitedAt: convertDateTimeDisplayFormat({ dateTime: item.exitedAt })
        }));
        const formattedDisplayRecords = formattedPlRecords.map(record => ({
          id: record.id,
          enteredAt: record.enteredAt,
          exitedAt: record.exitedAt,
          baseCurrency: record.baseCurrency,
          quoteCurrency: record.quoteCurrency,
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
        setDisplayRecords(formattedDisplayRecords);
      }

      // 最新の戦略取得
      if (newStrategies) {
        const sortedRecords = sortItems<Strategy>({ items: newStrategies, keyName: 'id', type: 'DSC'});
        const formattedRecords = sortedRecords.map(item => ({
          ...item,
          week: convertDateTimeDisplayFormat({ dateTime: item.week, isWeek: true }),
        }));
        setLatestStrategy(formattedRecords[0]);
      }

      // ローディング終了
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
      <>
        <div className='grid grid-cols-1 px-4 gap-4'>
          <div className='sticky top-0'>
            <p className='text-lightGray'>最終更新: {latestStrategy.week}</p>
            <p className='text-secondary'>{latestStrategy.strategy}</p>
          </div>
          {displayRecords.map((item, index) => (
            <Link key={index} href={`/record/pl/${item.id}`}>
              <div className='bg-darkGray rounded-lg px-5 py-3 w-full h-full'>
                {item.isSettled ? (
                  <>
                    <p className='text-xl text-lightGray'>{ item.enteredAt }　→　{ item.exitedAt }</p>
                    <p className={`${ item.profitLossPips >= 0 ? 'text-positive' : 'text-negative' }`}>
                      {item.baseCurrency}/{item.quoteCurrency}　{ item.profitLossPips } (pips)
                    </p>
                  </>
                ) : (
                  <>
                    <p className='text-xl text-lightGray'>{ item.enteredAt }　→　取引中</p>
                    <p>{item.baseCurrency}/{item.quoteCurrency}</p>
                  </>
                )}
                <p className='text-lightGray line-clamp-3'>{ item.reason }</p>
                <p　className='text-lightGray'>↓</p>
                <p className='text-lightGray line-clamp-3'>{ item.result }</p>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  }
};

const ItemLoading = () => {
  return(
    <></>
  );
};