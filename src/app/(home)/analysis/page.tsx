import { ResultCard } from '@/app/(home)/analysis/ResultCard';
import { ResultGraph } from '@/app/(home)/analysis/ResultGraph';

export default async function Home() {
  return (
    <>
      <div className='flex flex-col h-screen'>
        <div className='py-6'>
          <ResultGraph />
        </div>
        <div className='flex-grow overflow-y-auto pb-16'>
          <ResultCard />
        </div>
      </div>
    </>
  );
}