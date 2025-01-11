export type Currencies = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'MXN' | 'NZD' | 'CAD' | 'CHF' | 'ZAR';

export type Position = 'long' | 'short';

export type Item = string | number | boolean | Currencies | Position;

export interface PlRecord extends Record<string, Item> {
  id: string;
  baseCurrency: Currencies;
  currencyAmountPerLot: number;
  currencyLot: number;
  enteredAt: string;
  entryPrice: number;
  exitedAt: string;
  exitPrice: number;
  initialLowerExitPrice: number;
  initialUpperExitPrice: number;
  isSettled: boolean;
  memo: string;
  position: Position;
  profitLossPrice: number;
  quoteCurrency: Currencies;
  reason: string;
  result: string;
}

export interface CfRecord extends Record<string, Item> {
  id: string;
  executedAt: string;
  memo: string;
  price: number;
  quoteCurrency: string;
}

export interface Strategy extends Record<string, Item> {
  id: string;
  memo: string;
  result: string;
  retrospective: string;
  strategy: string;
  week: string;
}