/* eslint-disable no-irregular-whitespace */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Strategy } from '@/types/type';
import { convertDateTimeDisplayFormat } from '@/lib/calc';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems } from '@/lib/dynamodb';

const initialStrategies: Strategy[] = [{
  id: '',
  memo: '',
  result: '',
  retrospective: '',
  strategy: '',
  week: '',
}];

export const RecordCards = () => {
  const [Strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const newStrategies = await fetchGETRequestItems<Strategy>({ endpoint: '/api/strategy/read-all-items' });
      if (newStrategies) {
        const sortedRecords = sortItems<Strategy>({ items: newStrategies, keyName: 'id', type: 'DSC'});
        const formattedRecords = sortedRecords.map(item => ({
          ...item,
          week: convertDateTimeDisplayFormat({ dateTime: item.week }),
        }));
        setStrategies(formattedRecords);
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
        {Strategies.map((item, index) => (
          <Link key={index} href={`/strategy/${item.id}`}>
            <div className='bg-darkGray rounded-lg px-5 py-3 w-full h-[150px]'>
              <p className='text-xl text-lightGray'>{ item.week }週</p>
              <p className='text-secondary line-clamp-1'>戦略　{ item.strategy }</p>
              <p className='text-lightGray line-clamp-1'>結果　{ item.result }</p>
              <p className='text-lightGray line-clamp-1'>振返　{ item.retrospective }</p>
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