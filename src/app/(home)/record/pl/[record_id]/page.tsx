import { RecordForm } from '@/app/(home)/record/pl/[record_id]/Form';

export default async function Home({ params }: { params: Promise<{ record_id: string }> }) {
  const recordId = (await params).record_id;
  return (
    <div className='pb-16'>
      <RecordForm recordId={recordId} />
    </div>
  );
}