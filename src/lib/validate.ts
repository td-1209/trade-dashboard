export const validateDateTime = (
  {dateTime}:
  {dateTime: string}
): string | null => {
  const regexDateTime = /^(\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])_(?:[01]\d|2[0-3])-[0-5]\d)$/;
  if (!dateTime.trim()) {
    return '未入力';
  } else if (!regexDateTime.test(dateTime)) {
    return 'フォーマットか数値範囲';
  } else {
    return null;
  }
};

export const validateFloat = <T>(
  { name, value, setFormData }:
  { name: string, value: string, setFormData: React.Dispatch<React.SetStateAction<T>> }
): string | null => {
  const regexFloat = /^-?\d+(\.\d+)?$/;
  const stringValue = value.trim();
  if (!stringValue) {
    return '未入力';
  } else if (!regexFloat.test(stringValue)) {
    return '無効な数値形式';
  } else {
    // note: parseFloatは引数が整数のとき返り値も整数
    setFormData(prev => ({...prev, [name]: parseFloat(value)}));
    return null;
  }
};

export const validateInteger = <T>(
  { name, value, setFormData }:
  { name: string, value: string, setFormData: React.Dispatch<React.SetStateAction<T>> }
): string | null => {
  const regexInteger = /^-?([1-9][0-9]{0,9}|0)$/;
  const stringValue = value.trim();
  if (!stringValue) {
    return '未入力';
  } else if (!regexInteger.test(stringValue)) {
    return '整数';
  } else {
    setFormData(prev => ({...prev, [name]: parseFloat(value)}));
    return null;
  }
};