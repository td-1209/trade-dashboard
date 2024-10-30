import { readAllItems } from '@/lib/dynamodb/pl';
import { ProfitLossRecordCard } from '@/app/(home)/component/Card';

export default async function Home() {
  const items = await readAllItems();
  return (
    <>
      <div className="grid grid-cols-1 p-4 gap-4">
        {items.map((item, index) => (
          <ProfitLossRecordCard key={index} {...item}/>
        ))}
      </div>
    </>
  );
}
  