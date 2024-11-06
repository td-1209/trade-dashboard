/* eslint-disable no-irregular-whitespace */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Method } from '@/types/type';
import { fetchGETRequestItems } from '@/lib/request';
import { sortItems } from '@/lib/dynamodb';

const initialMethods: Method[] = [{
  id: '',
  name: '',
  detail: '',
  memo: '' 
}];

export const RecordCards = () => {
  const [methods, setMethods] = useState<Method[]>(initialMethods);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const newMethods = await fetchGETRequestItems<Method>({ endpoint: '/api/method/read-all-items' });
      if (newMethods) {
        const sortedRecords = sortItems<Method>({ items: newMethods, keyName: 'id', type: 'DSC'});
        setMethods(sortedRecords);
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
        {methods.map((item, index) => (
          <Link key={index} href={`/method/${item.id}`}>
            <div className='bg-darkGray rounded-lg px-5 py-3 w-full h-[150px]'>
              <p className='text-xl text-lightGray'>{ item.name }</p>
              <p className='line-clamp-3'>{ item.detail }</p>
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