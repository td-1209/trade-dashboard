import { RecordForm } from '@/app/(home)/record/pl/[record_id]/Form';

export default async function Home({ params }: { params: Promise<{ record_id: string }> }) {
  // bug: DB系処理を全てRecordFormに渡す（2回目のカード変更で過去のDBの値がキャッシュされてしまうため）
  const recordId = (await params).record_id;
  return (
    <>
      <RecordForm recordId={recordId} />
    </>
  );
}