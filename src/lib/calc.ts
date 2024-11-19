import { parse, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import { Currencies, Position, TimeZone } from '@/types/type';

export function generateULID(initialWord: string): string {
  const timeNow = Date.now();
  const timestamp = timeNow.toString(32).padStart(10, '0');
  const randomness = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 32).toString(32)
  ).join('');
  return initialWord+(timestamp + randomness).toUpperCase();
}

interface calculatePipsProps {
  quoteCurrency: Currencies;
  entryPrice: number;
  exitPrice: number;
  position: Position;
}

export function calculatePips({ quoteCurrency, entryPrice, exitPrice, position }: calculatePipsProps): number {
  let sign: number;
  switch (position) {
  case 'long':
    sign = 1;
    break;
  case 'short':
    sign = -1;
    break;
  default:
    throw new Error('エントリータイプの値が不正です。');
  }
  switch (quoteCurrency) {
  case 'JPY':
    return parseFloat((sign * (exitPrice - entryPrice) * 100).toFixed(3));
  // 新興国通貨はpipsが拡大する傾向あり
  case 'ZAR':
  case 'MXN':
    return parseFloat((sign * (exitPrice - entryPrice) * 100 / 10).toFixed(3));
  default:
    return parseFloat((sign * (exitPrice - entryPrice) * 10000).toFixed(3));
  }
}

interface convertDateTimeDisplayFormatProps {
  dateTime: string;
  timeZone: TimeZone;
}

export function convertDateTimeDisplayFormat({ dateTime, timeZone }: convertDateTimeDisplayFormatProps) {
  let jstString: string;
  try {
    const parsedDate = parse(dateTime, 'yyyy-MM-dd_HH-mm', new Date());
    const isoString = format(parsedDate, 'yyyy-MM-dd\'T\'HH:mm:ss') + timeZone;
    const dateTimeObject = new Date(isoString);
    const jstDateTime = toZonedTime(dateTimeObject, 'Asia/Tokyo');
    jstString = format(jstDateTime, 'yy.MM.dd.E', {locale: ja});
  } catch  {
    jstString = '日付エラー';
  }
  return jstString;
}

interface calculateMaxLotSize {
  tradingCapital: number;
  entryPrice: number;
  lossCutPrice: number;
  currencyAmountPerLot: number;
  maintenanceMarginRatio?: number;
}

export function calculateMaxLotSize({ tradingCapital, entryPrice, lossCutPrice, currencyAmountPerLot, maintenanceMarginRatio = 20 }: calculateMaxLotSize) {
  const maxLotSize = tradingCapital/((maintenanceMarginRatio*entryPrice)+currencyAmountPerLot*Math.abs(entryPrice-lossCutPrice));
  return maxLotSize;
}

interface calculateRiskReward {
  entryPrice: number;
  lossCutPrice: number;
  takeProfitPrice: number;
}

export function calculateRiskReward({ entryPrice, lossCutPrice, takeProfitPrice }: calculateRiskReward) {
  const riskReward = (takeProfitPrice - entryPrice)/(entryPrice - lossCutPrice);
  return riskReward;
}

interface calculateRequiredMargin {
  entryPrice: number;
  currencyAmountPerLot: number;
  maintenanceMarginRatio?: number;
  lotSize: number;
  leverage?: number;
}

export function calculateRequiredMargin({ entryPrice, currencyAmountPerLot, lotSize, leverage = 1000 }: calculateRequiredMargin) {
  const currencyAmount = currencyAmountPerLot*lotSize;
  const requiredMargin = currencyAmount/leverage*entryPrice;
  return requiredMargin;
}