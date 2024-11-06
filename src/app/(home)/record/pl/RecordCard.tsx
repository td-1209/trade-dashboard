/* eslint-disable no-irregular-whitespace */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlRecord, Method } from '@/types/type';
import { convertDateTimeDisplayFormat } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems, convertItemListToDict } from '@/lib/dynamodb';

// const currencySymbols: { [key: string]: string } = {
//   USD: '$',
//   EUR: '€',
//   JPY: '¥',
//   GBP: '£',
// };

const initialPlRecords: PlRecord[] = [{
  id: '',
  enteredAt: '',
  exitedAt: '',
  timeZone: '+00:00',
  baseCurrency: 'USD',
  quoteCurrency: 'JPY',
  currencyAmount: 0,
  position: 'long',
  entryPrice: 0,
  exitPrice: 0,
  profitLossPrice: 0,
  profitLossPips: -0,
  method: '',
  isDemo: false,
  memo: '',
}];

const initialMethods: {[id: string]: Method} = {
  id: { id: '', name: '', detail: '', memo: '' }
};

export const RecordCards = () => {
  const [plRecords, setPlRecords] = useState<PlRecord[]>(initialPlRecords);
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
        const formattedRecords = sortedRecords.map(item => ({
          ...item,
          enteredAt: convertDateTimeDisplayFormat({ dateTime: item.enteredAt, timeZone: item.timeZone }),
          exitedAt: convertDateTimeDisplayFormat({ dateTime: item.exitedAt, timeZone: item.timeZone })
        }));
        setPlRecords(formattedRecords);
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
        {plRecords.map((item, index) => (
          <Link key={index} href={`/record/pl/${item.id}`}>
            <div className='bg-darkGray rounded-lg px-5 py-3 w-full h-[150px]'>
              <p className='text-xl font-bold text-lightGray'>{ item.enteredAt }　→　{ item.exitedAt }</p>
              <p className={`font-bold ${ item.profitLossPrice >= 0 ? 'text-positive' : 'text-negative' }`}>
                結果　{ item.profitLossPips } (pips)
              </p>
              <p className='font-bold text-lightGray'>ペア　{item.isDemo && '(デモ)'}{item.baseCurrency}/{item.quoteCurrency}</p>
              <p className='font-bold text-lightGray'>手法　{ methods[item.method]?.name }</p>
              <p className='font-bold text-lightGray line-clamp-1'>メモ　{ item.memo }</p>
              {/* <p>
                { currencySymbols[item.quoteCurrency] }{ item.entryPrice }
                {
                  item.position.toLowerCase() === 'long' ? ' (買い)' :
                    item.position.toLowerCase() === 'short' ? ' (売り)' :
                      item.position
                }　→　
                { currencySymbols[item.quoteCurrency] }{ item.exitPrice }
                {
                  item.position.toLowerCase() === 'long' ? ' (売り)' :
                    item.position.toLowerCase() === 'short' ? ' (買い)' :
                      item.position
                }
              </p> */}
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