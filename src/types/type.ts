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
  | 'ZAR';

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
  reason_image: string;
  result_image: string | null;
}

export interface CF extends Record<string, unknown> {
  id: string;
  quote_currency: string;
  executed_at: string;
  price: number;
}
