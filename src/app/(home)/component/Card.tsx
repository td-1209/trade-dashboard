import { Item } from '@/lib/dynamodb/pl';

export const ProfitLossRecordCard = (item: Item) => {
  return (
    <div className="bg-darkGray rounded-lg p-4">
      <p>{item.enteredAt} - {item.exitedAt}</p>
      <p>ペア　{item.isDemo && '(デモ)'}{item.baseCurrency}/{item.quoteCurrency}</p>
      <p>
        {
          item.entryType.toLowerCase() === 'buy' ? '買い' :
            item.entryType.toLowerCase() === 'sell' ? '売り' :
              item.entryType
        }　{item.entryPrice}　
      </p>
      <p>
        {
          item.entryType.toLowerCase() === 'buy' ? '売り' :
            item.entryType.toLowerCase() === 'sell' ? '買い' :
              item.entryType
        }　{item.entryPrice}
      </p>
      <p className={`${item.profitLossPrice >= 0 ? 'text-positive' : 'text-negative'}`}>
      損益　{item.profitLossPrice.toFixed(2)}（{item.profitLossPips}pips）
      </p>
      <p>通貨　{item.currencyAmount}</p>
      <p>手法　{item.method}</p>
      <p>{item.isDemo ? true : false}</p>
      <p className="text-lightGray">メモ　{item.memo}</p>
    </div>
  );
};