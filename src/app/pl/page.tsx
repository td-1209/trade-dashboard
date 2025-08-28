'use client';

import { SingleButton } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  convertJSTInputFormatToDisplayFormat,
  convertUTCISOStringToJSTInputFormat,
} from '@/lib/calc';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DisplayRecord {
  id: string;
  entered_at: string;
  exited_at: string;
  base_currency: string;
  quote_currency: string;
  profit_loss: number;
  reason_detail: string;
  result_detail: string;
}

export default function Home() {
  const [displayRecords, setDisplayRecords] = useState<DisplayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const handleNewPLClick = () => {
    router.push('/pl/new');
  };
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: plData } = await supabase
        .from('pl')
        .select('*')
        .order('entered_at', { ascending: false });
      if (plData) {
        const records: DisplayRecord[] = plData.map((record) => ({
          id: record.id,
          entered_at: convertJSTInputFormatToDisplayFormat({
            dateTime: convertUTCISOStringToJSTInputFormat({
              isoString: record.entered_at,
            }),
          }),
          exited_at: record.exited_at
            ? convertJSTInputFormatToDisplayFormat({
                dateTime: convertUTCISOStringToJSTInputFormat({
                  isoString: record.exited_at,
                }),
              })
            : '',
          base_currency: record.base_currency,
          quote_currency: record.quote_currency,
          profit_loss: record.profit_loss || 0,
          reason_detail: record.reason_detail,
          result_detail: record.result_detail,
        }));
        setDisplayRecords(records);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);
  if (isLoading) {
    return <></>;
  } else {
    return (
      <>
        <div className='fixed top-4 right-4 z-10'>
          <SingleButton label='追加' action={handleNewPLClick} />
        </div>
        <div className='grid grid-cols-1 gap-4 pt-16'>
          {displayRecords.map((item, index) => (
            <Card key={index} href={`/pl/${item.id}`}>
              {item.exited_at ? (
                <>
                  <p className='text-xl text-lightGray'>
                    {item.entered_at}　→　{item.exited_at}
                  </p>
                  <p
                    className={`${
                      item.profit_loss >= 0 ? 'text-positive' : 'text-negative'
                    }`}
                  >
                    {item.base_currency}/{item.quote_currency}　 ¥
                    {item.profit_loss.toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <p className='text-xl text-lightGray'>
                    {item.entered_at}　→　取引中
                  </p>
                  <p>
                    {item.base_currency}/{item.quote_currency}
                  </p>
                </>
              )}
              <p className='text-lightGray line-clamp-3'>
                {item.reason_detail}
              </p>
              <p className='text-lightGray'>↓</p>
              <p className='text-lightGray line-clamp-3'>
                {item.result_detail}
              </p>
            </Card>
          ))}
        </div>
      </>
    );
  }
}
