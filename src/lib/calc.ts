import { format, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';

interface calculatePipsProps {
  quoteCurrency: string;
  entryPrice: number;
  exitPrice: number;
  position: string;
}

export function calculatePips({
  quoteCurrency,
  entryPrice,
  exitPrice,
  position,
}: calculatePipsProps): number {
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
      return parseFloat(
        ((sign * (exitPrice - entryPrice) * 10000) / 10).toFixed(3)
      );
    default:
      return parseFloat((sign * (exitPrice - entryPrice) * 10000).toFixed(3));
  }
}

interface convertJSTInputFormatToDisplayFormatProps {
  dateTime: string;
  isWeek?: boolean;
}

// JSTの入力を想定
export function convertJSTInputFormatToDisplayFormat({
  dateTime,
  isWeek = false,
}: convertJSTInputFormatToDisplayFormatProps) {
  let jstString: string;
  try {
    const parsedDate = parse(dateTime, 'yyyy-MM-dd_HH-mm', new Date());
    const isoString = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss") + '+09:00';
    const dateTimeObject = new Date(isoString);
    const jstDateTime = toZonedTime(dateTimeObject, 'Asia/Tokyo');
    if (isWeek) {
      jstString = format(jstDateTime, 'MM/dd週', { locale: ja });
    } else {
      jstString = format(jstDateTime, 'MM/dd(E)', { locale: ja });
    }
  } catch {
    jstString = '日付エラー';
  }
  return jstString;
}

interface convertJSTInputFormatToJSTISOStringProps {
  dateTime: string;
}

// JSTの入力を想定
export function convertJSTInputFormatToJSTISOString({
  dateTime,
}: convertJSTInputFormatToJSTISOStringProps): string {
  try {
    const parsedDate = parse(dateTime, 'yyyy-MM-dd_HH-mm', new Date());
    const isoString = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss") + '+09:00';
    return isoString;
  } catch {
    throw new Error('日付形式が正しくありません');
  }
}

interface convertUTCISOStringToJSTInputFormatProps {
  isoString: string;
}

// UTCの入力を想定
export function convertUTCISOStringToJSTInputFormat({
  isoString,
}: convertUTCISOStringToJSTInputFormatProps): string {
  try {
    // UTC ISO文字列をDateオブジェクトに変換
    const utcDate = new Date(isoString);
    // UTCからJSTに変換
    const jstDate = toZonedTime(utcDate, 'Asia/Tokyo');
    // JSTをinputFormat（yyyy-MM-dd_HH-mm）に変換
    return format(jstDate, 'yyyy-MM-dd_HH-mm');
  } catch {
    throw new Error('ISO文字列の形式が正しくありません');
  }
}
