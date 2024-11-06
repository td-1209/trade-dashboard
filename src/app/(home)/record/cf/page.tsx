import { NewRecordButton } from '@/app/(home)/components/NewRecordButton';
import { RecordCards } from '@/app/(home)/record/cf/RecordCard';

export default async function Home() {
  return (
    <>
      <div className='flex flex-col h-screen'>
        <div className='p-4 flex justify-end'>
          <NewRecordButton prefix={'cf-'} path={'/record/cf/'} />
        </div>
        <div className='flex-grow overflow-y-auto pb-16'>
          <RecordCards />
        </div>
      </div>
    </>
  );
}