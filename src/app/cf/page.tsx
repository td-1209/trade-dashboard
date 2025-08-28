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
  executed_at: string;
  quote_currency: string;
  price: number;
}

export default function Home() {
  const [displayRecords, setDisplayRecords] = useState<DisplayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const handleNewCFClick = () => {
    router.push('/cf/new');
  };
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: cfData } = await supabase
        .from('cf')
        .select('*')
        .order('executed_at', { ascending: false });
      if (cfData) {
        const records: DisplayRecord[] = cfData.map((record) => ({
          id: record.id,
          executed_at: convertJSTInputFormatToDisplayFormat({
            dateTime: convertUTCISOStringToJSTInputFormat({
              isoString: record.executed_at,
            }),
          }),
          quote_currency: record.quote_currency,
          price: record.price || 0,
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
        <div className='grid grid-cols-1 gap-4'>
          <div className='fixed top-4 right-4 z-10'>
            <SingleButton label='追加' action={handleNewCFClick} />
          </div>
          <div className='grid grid-cols-1 gap-4 pt-16'>
            {displayRecords.map((item, index) => (
              <Card key={index} href={`/cf/${item.id}`}>
                <p className='text-xl text-lightGray'>{item.executed_at}</p>
                <p className='text-positive'>
                  {item.quote_currency}　¥{item.price.toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }
}
