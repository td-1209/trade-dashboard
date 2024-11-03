import { RecordForm } from '@/app/(home)/record/pl/[record_id]/Form';
import { isExistPartitionKey, readItem, readAllItems } from '@/lib/dynamodb';
import { PlRecord, Method } from '@/types/type'; 

export default async function Home({ params }: { params: Promise<{ record_id: string }> }) {
  // bug: DB系処理を全てRecordFormに渡す（2回目のカード変更で過去のDBの値がキャッシュされてしまうため）
  const recordId = (await params).record_id;
  const isExistRecord = await isExistPartitionKey({ partitionKeyName: 'id', partitionKeyValue: recordId, tableName: 'td-profit-loss' });
  const existPlRecord = isExistRecord ? await readItem<PlRecord>({ partitionKey: { id: recordId }, tableName: 'td-profit-loss' }) : undefined;
  const methods = await readAllItems<Method>({ tableName: 'td-method' });
  return (
    <>
      <RecordForm recordId={recordId} isExistRecord={isExistRecord} existPlRecord={existPlRecord} methods={methods} />
    </>
  );
}