export type Currencies = 'USD' | 'JPY' | 'GBP' | 'AUD' | 'EUR' | 'NZD';

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
  currencyAmount: number;
  position: Position;
  entryPrice: number;
  exitPrice: number;
  profitLossPrice: number;
  profitLossPips: number;
  method: string;
  isDemo: boolean;
  memo: string;
}

export interface Method extends Record<string, Item> {
  id: string;
  name: string;
  detail: string;
  memo: string;
}