import {createItem, readItem, readAllItems, readItemsWithCondition, updateItem, deleteItem, Item} from '@/lib/dynamodb/pl';

export default async function Home() {
  // const item: Item = {
  //   id: 'ZZZ',
  //   enteredAt: 'ZZZ',
  //   exitedAt: 'ZZZ',
  //   baseCurrency: 'ZZZ',
  //   quoteCurrency: 'ZZZ',
  //   currencyAmount: 1,
  //   entryType: 'ZZZ',
  //   entryPrice: 1,
  //   exitPrice: 1,
  //   profitLossPrice: 1,
  //   profitLossPips: 1,
  //   method: 'ZZZ',
  //   isDemo: true,
  //   memo: 'ZZZ',
  // };
  // await createItem({ item: item });

  // const key = {id: 'YYY'};
  // const item = await readItem({ key: key });

  // const items = await readAllItems();

  // const key = {id: 'YYY'};
  // const updateFields = {
  //   enteredAt: 'YYY-updated',
  //   exitedAt: 'YYY-updated',
  // }
  // await updateItem({ key: key, updateFields: updateFields });

  // const key = {id: 'XXX'};
  // await deleteItem({ key: key });

  // const items = await readItemsWithCondition({
  //   secondaryIndex: 'baseCurrency-quoteCurrency-index',
  //   partitionKey: {field: 'baseCurrency', operator: '=', value: 'YYY', matchType: 'AND'},
  //   sortKey: {field: 'quoteCurrency', operator: '=', value: 'YYY'},
  // });

  return (
    <>
      test
      {/* {items.map((item, index) => (
        <p className='text-secondary'>{ item.id }</p>
      ))
      } */}
    </>
  );
}