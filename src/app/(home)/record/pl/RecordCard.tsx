/* eslint-disable no-irregular-whitespace */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlRecord, Method, Item, Currencies } from '@/types/type';
import { calculatePips, convertDateTimeDisplayFormat } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems, convertItemListToDict } from '@/lib/dynamodb';

// const currencySymbols: { [key: string]: string } = {
//   USD: '$',
//   EUR: '€',
//   JPY: '¥',
//   GBP: '£',
// };

const initialMethods: {[id: string]: Method} = {
  id: { id: '', name: '', detail: '', memo: '' }
};

interface DisplayRecord extends Record<string, Item> {
  id: string;
  enteredAt: string;
  exitedAt: string;
  baseCurrency: Currencies;
  quoteCurrency: Currencies;
  profitLossPips: number;
  method: string;
  isDemo: boolean;
  isSettled: boolean;
  memo: string;
}

const initialDisplayRecords: DisplayRecord[] = [{
  id: '',
  enteredAt: '',
  exitedAt: '',
  baseCurrency: 'USD',
  quoteCurrency: 'JPY',
  profitLossPips: 0,
  method: '',
  isDemo: false,
  isSettled: false,
  memo: '',
}];

export const RecordCards = () => {
  const [displayRecords, setDisplayRecords] = useState<DisplayRecord[]>(initialDisplayRecords);
  const [methods, setMethods] = useState<{[id: string]: Method}>(initialMethods);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const [newRecords, newMethods] = await Promise.all([
        fetchGETRequestItems<PlRecord>({ endpoint: '/api/pl/read-all-items' }),
        fetchGETRequestItems<Method>({ endpoint: '/api/method/read-all-items' })
      ]);
      if (newRecords) {
        const sortedRecords = sortItems<PlRecord>({ items: newRecords, keyName: 'id', type: 'DSC'});
        const formattedPlRecords = sortedRecords.map(item => ({
          ...item,
          enteredAt: convertDateTimeDisplayFormat({ dateTime: item.enteredAt, timeZone: item.timeZone }),
          exitedAt: convertDateTimeDisplayFormat({ dateTime: item.exitedAt, timeZone: item.timeZone })
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
          method: record.method,
          isDemo: record.isDemo,
          isSettled: record.isSettled,
          memo: record.memo,
        }));
        setDisplayRecords(formattedDisplayRecords);
      }
      if (newMethods) {
        const formattedMethods = convertItemListToDict<Method>({ key: 'id', items: newMethods });
        setMethods(formattedMethods);
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
          <Link key={index} href={`/record/pl/${item.id}`}>
            <div className='bg-darkGray rounded-lg px-5 py-3 w-full h-[150px]'>
              {item.isSettled ? (
                <>
                  <p className='text-xl text-lightGray'>{ item.enteredAt }　→　{ item.exitedAt }</p>
                  <p className={`${ item.profitLossPips >= 0 ? 'text-positive' : 'text-negative' }`}>
                    結果　{ item.profitLossPips } (pips)
                  </p>
                </>
              ) : (
                <>
                  <p className='text-xl text-lightGray'>{ item.enteredAt }　→　取引中</p>
                </>
              )}
              <p className='text-lightGray'>ペア　{item.isDemo && '(デモ)'}{item.baseCurrency}/{item.quoteCurrency}</p>
              <p className='text-lightGray'>手法　{ methods[item.method]?.name }</p>
              <p className='text-lightGray line-clamp-1'>{ item.memo }</p>
            </div>
          </Link>
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