import Link from 'next/link';
import { readAllItems, sortItems } from '../../../../lib/dynamodb';
import { ProfitLossRecordCard } from '../../../../app/(home)/component/Card';
import { DummyButton } from '../../../../app/(home)/component/Button';
import { generateULID } from '../../../../lib/calc';
import { PlRecord } from '../../../../types/type';

export default async function Home() {
  const items = await readAllItems<PlRecord>({ tableName: 'td-profit-loss' });
  const sortedItems = sortItems({ items: items, keyName: 'id', type: 'DSC'});
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
            {sortedItems.map((item, index) => (
              <ProfitLossRecordCard key={index} {...item}/>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
  