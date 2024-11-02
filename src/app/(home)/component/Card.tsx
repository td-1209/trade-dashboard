/* eslint-disable no-irregular-whitespace */

import Link from 'next/link';
import { PlRecord, Method } from '@/types/type';
import { processInputToDateTime } from '@/lib/calc';
import { readItem } from '@/lib/dynamodb';

export const ProfitLossRecordCard = async (item: PlRecord) => {
  const formattedEnteredAt = processInputToDateTime({ dateTime: item.enteredAt, timeZone: item.timeZone });
  const formattedExitedAt = processInputToDateTime({ dateTime: item.exitedAt, timeZone: item.timeZone });
  const method = await readItem<Method>({ partitionKey: { id: item.method }, tableName: 'td-method' });
  const currencySymbols: { [key: string]: string } = {
    USD: '$ ',
    EUR: '€ ',
    JPY: '¥ ',
    GBP: '£ ',
  };
  return (
    <Link href={`/record/pl/${item.id}`}>
      <div className='bg-darkGray rounded-lg p-5'>
        <p className='py-1 text-xl font-bold text-lightGray'>{item.isDemo && '(デモ)'}{item.baseCurrency}/{item.quoteCurrency}</p>
        <p>{ formattedEnteredAt }　→　{ formattedExitedAt }</p>
        <p>
          { currencySymbols[item.quoteCurrency] }{ item.entryPrice }
          {
            item.position.toLowerCase() === 'long' ? ' (買い)' :
              item.position.toLowerCase() === 'short' ? ' (売り)' :
                item.position
          }　→　
          { currencySymbols[item.quoteCurrency] }{ item.exitPrice }
          {
            item.position.toLowerCase() === 'long' ? ' (売り)' :
              item.position.toLowerCase() === 'short' ? ' (買い)' :
                item.position
          }
        </p>
        <p className={`${ item.profitLossPrice >= 0 ? 'text-positive' : 'text-negative' }`}>
          { currencySymbols[item.quoteCurrency] }{ item.profitLossPrice } (pips { item.profitLossPips })
        </p>
        <p>{ item.currencyAmount } 通貨</p>
        <p>{ method.name }</p>
        <p className='py-1 text-lightGray'>{ item.memo }</p>
      </div>
    </Link>
  );
};