export type Currency =
  | 'USD'
  | 'EUR'
  | 'JPY'
  | 'GBP'
  | 'AUD'
  | 'MXN'
  | 'NZD'
  | 'CAD'
  | 'CHF'
  | 'ZAR'
  | 'none';

export type Position = 'long' | 'short';

export type Domain = 'fx' | 'stock' | 'gold';

export interface PL extends Record<string, unknown> {
  id: string;
  base_currency: Currency;
  quote_currency: Currency | null;
  entered_at: string;
  exited_at: string | null;
  position: Position;
  entry: number;
  exit: number | null;
  profit_loss: number | null;
  reason_detail: string;
  result_detail: string | null;
  take_profit: number;
  loss_cut: number;
  domain: Domain;
  method: string;
  reason_image: string | null;
  result_image: string | null;
}

export interface CF extends Record<string, unknown> {
  id: string;
  quote_currency: string;
  executed_at: string;
  price: number;
}

export const positionOptions: {
  value: Position;
  label: 'ロング' | 'ショート';
}[] = [
  { value: 'long', label: 'ロング' },
  { value: 'short', label: 'ショート' },
];

export const currencyOptions: {
  value: Currency;
  label: Currency;
}[] = [
  { value: 'none', label: 'none' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'JPY', label: 'JPY' },
  { value: 'GBP', label: 'GBP' },
  { value: 'AUD', label: 'AUD' },
  { value: 'MXN', label: 'MXN' },
  { value: 'NZD', label: 'NZD' },
  { value: 'CAD', label: 'CAD' },
  { value: 'CHF', label: 'CHF' },
  { value: 'ZAR', label: 'ZAR' },
];

export const domainOptions: {
  value: Domain;
  label: string;
}[] = [
  { value: 'fx', label: '外貨' },
  { value: 'stock', label: '株式' },
  { value: 'gold', label: '金' },
];

export const methodOptions: {
  value: string;
  label: string;
}[] = [
  { value: 'elliott', label: 'エリオット' },
  { value: 'range', label: 'レンジ' },
  { value: 'spike', label: '急騰落' },
  { value: 'unknown', label: '手法が未指定' },
];
