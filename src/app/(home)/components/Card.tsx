/* eslint-disable no-irregular-whitespace */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PlRecord, Method } from '@/types/type';
import { processInputToDateTime } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems, convertItemListToDict } from '@/lib/dynamodb';

const currencySymbols: { [key: string]: string } = {
  USD: '$ ',
  EUR: '€ ',
  JPY: '¥ ',
  GBP: '£ ',
};

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

export const ProfitLossRecordCard = () => {
  const [plRecords, setPlRecords] = useState<PlRecord[]>(initialPlRecords);
  const [methods, setMethods] = useState<{[id: string]: Method}>(initialMethods);
  const pathname = usePathname();
  useEffect(() => {
    const fetchData = async () => {
      const [newRecords, newMethods] = await Promise.all([
        fetchGETRequestItems<PlRecord>({ endpoint: '/api/pl/read-all-items' }),
        fetchGETRequestItems<Method>({ endpoint: '/api/method/read-all-items' })
      ]);
      const sortedRecords = sortItems<PlRecord>({ items: newRecords, keyName: 'id', type: 'DSC'});
      const formattedRecords = sortedRecords.map(item => ({
        ...item,
        enteredAt: processInputToDateTime({ dateTime: item.enteredAt, timeZone: item.timeZone }),
        exitedAt: processInputToDateTime({ dateTime: item.exitedAt, timeZone: item.timeZone })
      }));
      setPlRecords(formattedRecords);
      const formattedMethods = convertItemListToDict<Method>({ key: 'id', items: newMethods });
      setMethods(formattedMethods);
    };
    fetchData();
  }, [pathname]);
  return (
    <>
      {plRecords.map((item, index) => (
        <Link key={index} href={`/record/pl/${item.id}`}>
          <div className='bg-darkGray rounded-lg p-5'>
            <p className='font-bold text-lightGray'>{item.isDemo && '(デモ)'}{item.baseCurrency}/{item.quoteCurrency}</p>
            <p className='text-xl font-bold text-lightGray'>{ item.enteredAt }　→　{ item.exitedAt }</p>
            <p className='font-bold text-lightGray'>{ item.memo }</p>
            <p className={`font-bold ${ item.profitLossPrice >= 0 ? 'text-positive' : 'text-negative' }`}>
              { currencySymbols[item.quoteCurrency] }{ item.profitLossPrice } (pips { item.profitLossPips })
            </p>
            <p>
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
            </p>
            <p>{ methods[item.method]?.name }　{ item.currencyAmount } 通貨</p>
          </div>
        </Link>
      ))}
    </>
  );
};