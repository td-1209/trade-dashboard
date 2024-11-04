import { NewRecordButton } from '@/app/(home)/components/NewRecordButton';
import { PlRecordCards } from '@/app/(home)/components/PlRecordCard';

export default async function Home() {
  return (
    <>
      <div className='flex flex-col h-screen'>
        <div className='p-4 flex justify-end'>
          <NewRecordButton prefix={'pl-'} path={'/record/pl/'} />
        </div>
        <div className='flex-grow overflow-y-auto pb-16'>
          <PlRecordCards />
        </div>
      </div>
    </>
  );
}
  