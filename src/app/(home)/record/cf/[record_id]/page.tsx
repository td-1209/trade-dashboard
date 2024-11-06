import { RecordForm } from '@/app/(home)/record/cf/[record_id]/Form';

export default async function Home({ params }: { params: Promise<{ record_id: string }> }) {
  const recordId = (await params).record_id;
  return (
    <>
      <RecordForm recordId={recordId} />
    </>
  );
}