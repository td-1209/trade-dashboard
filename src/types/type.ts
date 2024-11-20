export type Currencies = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'MXN' | 'NZD' | 'CAD' | 'CHF' | 'ZAR';
export type Position = 'long' | 'short';

export type TimeZone = '+00:00' | '+02:00' | '+03:00' | '+09:00';

export type Item = string | number | boolean | TimeZone | Currencies | Position;

export interface PlRecord extends Record<string, Item> {
  id: string;
  enteredAt: string;
  exitedAt: string;
  timeZone: TimeZone;
  baseCurrency: Currencies;
  quoteCurrency: Currencies;
  currencyLot: number;
  currencyAmountPerLot: number;
  position: Position;
  initialUpperExitPrice: number;
  initialLowerExitPrice: number;
  entryPrice: number;
  exitPrice: number;
  profitLossPrice: number;
  method: string;
  isDemo: boolean;
  isSettled: boolean;
  memo: string;
}

export interface CfRecord extends Record<string, Item> {
  id: string;
  executedAt: string;
  timeZone: TimeZone;
  quoteCurrency: string;
  price: number;
  bonus: number;
  memo: string;
}

export interface Method extends Record<string, Item> {
  id: string;
  name: string;
  detail: string;
  memo: string;
}

export interface Strategy extends Record<string, Item> {
  id: string;
  startedAt: string;
  endedAt: string;
  timeZone: TimeZone;
  strategy: string;
  result: string;
  retrospective: string;
  memo: string;
}