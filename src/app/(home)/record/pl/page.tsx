import { NewRecordButton } from '@/app/(home)/components/NewRecordButton';
import { ProfitLossRecordCard } from '@/app/(home)/components/Card';

export default async function Home() {
  return (
    <>
      <div className='flex flex-col h-screen'>
        <div className='p-4 flex justify-end'>
          <NewRecordButton prefix={'pl-'} path={'/record/pl/'} />
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
  