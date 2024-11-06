/* eslint-disable no-irregular-whitespace */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CfRecord } from '@/types/type';
import { convertDateTimeDisplayFormat } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems } from '@/lib/dynamodb';

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
};

const initialCfRecords: CfRecord[] = [{
  id: '',
  executedAt: '',
  timeZone: '+00:00',
  quoteCurrency: 'JPY',
  price: 0,
  memo: '',
}];

export const RecordCards = () => {
  const [CfRecords, setCfRecords] = useState<CfRecord[]>(initialCfRecords);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const newRecords = await fetchGETRequestItems<CfRecord>({ endpoint: '/api/cf/read-all-items' });
      if (newRecords) {
        const sortedRecords = sortItems<CfRecord>({ items: newRecords, keyName: 'id', type: 'DSC'});
        const formattedRecords = sortedRecords.map(item => ({
          ...item,
          executedAt: convertDateTimeDisplayFormat({ dateTime: item.executedAt, timeZone: item.timeZone })
        }));
        setCfRecords(formattedRecords);
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
        {CfRecords.map((item, index) => (
          <Link key={index} href={`/record/cf/${item.id}`}>
            <div className='bg-darkGray rounded-lg px-5 py-3 w-full h-[110px]'>
              <p className='text-xl text-lightGray'>{ item.executedAt }</p>
              <p className={`${ item.price >= 0 ? 'text-orange-600' : 'text-blue-600' }`}>
                { item.price >= 0 ? '入金' : '出金' }　{ currencySymbols[item.quoteCurrency] }{ item.price }
              </p>
              <p className='text-lightGray line-clamp-1'>メモ　{ item.memo }</p>
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