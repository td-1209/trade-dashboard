import Link from 'next/link';
import { ProfitLossRecordCard } from '@/app/(home)/components/Card';
import { DummyButton } from '@/app/(home)/components/Button';
import { generateULID } from '@/lib/calc';

export default async function Home() {
  // bug: 計算結果までキャッシュされてるのでボタンごとClientCompに
  const plRecordId = generateULID('pl-');
  return (
    <>
      <div className='flex flex-col h-screen'>
        <div className='p-4 flex justify-end'>
          <Link href={`/record/pl/${plRecordId}`}>
            <DummyButton label='新規登録'/>
          </Link>
        </div>
        <div className='flex-grow overflow-y-auto pb-16'>
          <div className='grid grid-cols-1 p-4 gap-4'>
            <ProfitLossRecordCard />
          </div>
        </div>
      </div>
    </>
  );
}
  