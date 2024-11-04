'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item, PlRecord, Position, TimeZone, Currencies, Method } from '@/types/type';
import { FormTwinButtons } from '@/app/(home)/components/Button';
import { TextForm, NumberForm, SelectForm, RadioForm } from '@/app/(home)/components/FormParts';
import { calculatePips } from '@/lib/calc';
import { fetchGETRequestItem, fetchGETRequestItems, fetchPostRequest } from '@/lib/request';
import { useFormData } from '@/hooks/formData';
import { validateDateTime, validateFloat, validateInteger } from '@/lib/validate';

const positionOptions: {
  value: Position;
  label: 'ロング' | 'ショート';
}[] = [
  { value: 'long', label: 'ロング' },
  { value: 'short', label: 'ショート' },
];

const timeZoneOptions: {
  value: TimeZone;
  label: TimeZone;
}[] = [
  { value: '+00:00', label: '+00:00' },
  { value: '+02:00', label: '+02:00' },
  { value: '+03:00', label: '+03:00' },
  { value: '+09:00', label: '+09:00' },
];

const currencyOptions: {
  value: Currencies;
  label: Currencies;
}[] = [
  { value: 'USD', label: 'USD' },
  { value: 'JPY', label: 'JPY' },
  { value: 'GBP', label: 'GBP' },
  { value: 'AUD', label: 'AUD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'NZD', label: 'NZD' },
];

const isDemoOptions = [
  { value: true, label: 'オン' },
  { value: false, label: 'オフ' }
];

interface RecordFormProps {
  recordId: string;
}

export function RecordForm({ recordId }: RecordFormProps) {
  // 初期値
  const initialItem: PlRecord = {
    id: recordId,
    enteredAt: '2024-11-01_01-01',
    exitedAt: '2024-11-30_01-01',
    timeZone: '+02:00',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    currencyAmount: 1000,
    position: 'long',
    entryPrice: 999.998,
    exitPrice: 999.999,
    profitLossPrice: 99999,
    profitLossPips: -999.999,
    method: '',
    isDemo: false,
    memo: '',
  };
  const initialMethodOptions = [
    { value: '', label: '' },
  ];

  // 型
  type Errors = {[K in keyof PlRecord]?: string};
  
  // 状態
  const [
    formData, updatedFields,
    {
      setFormData, setUpdatedFields,
      handleChangeStringForm, handleChangeNumberForm,
      handleChangeSelectForm, handleChangeRadioForm, resetUpdatedFields
    }
  ] = useFormData(initialItem);
  const [isExistRecord, setIsExistRecord] = useState<boolean>(false);
  const [methodOptions, setMethodOptions] = useState<{ value: string; label: string; }[]>(initialMethodOptions);
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();

  // バリデーション
  const validateForm = () => {
    const newErrors: Errors = {};
    
    // 時間系
    const enteredAtError = validateDateTime({ dateTime: formData.enteredAt});
    const exitedAtError = validateDateTime({ dateTime: formData.exitedAt});
    if (enteredAtError) newErrors.enteredAt = enteredAtError;
    if (exitedAtError) newErrors.exitedAt = exitedAtError;

    // 数字系
    const entryPriceError = validateFloat({ name: 'entryPrice', value: formData.entryPrice.toString(), setFormData: setFormData});
    const exitPriceError = validateFloat({ name: 'exitPrice', value: formData.exitPrice.toString(), setFormData: setFormData});
    const currencyAmountError = validateInteger({ name: 'currencyAmount', value: formData.currencyAmount.toString(), setFormData: setFormData});
    const profitLossPriceError = validateInteger({ name: 'profitLossPrice', value: formData.profitLossPrice.toString(), setFormData: setFormData});
    if (entryPriceError) newErrors.entryPrice = entryPriceError;
    if (exitPriceError) newErrors.exitPrice = exitPriceError;
    if (currencyAmountError) newErrors.currencyAmount = currencyAmountError;
    if (profitLossPriceError) newErrors.profitLossPrice = profitLossPriceError;

    // ロジック系（他バリデーションを優先）
    if (Object.keys(newErrors).length === 0) {
      // 通貨ペアが異なっているか検証
      if (formData.baseCurrency === formData.quoteCurrency) {
        newErrors.baseCurrency = '通貨ペア';
        newErrors.quoteCurrency = '通貨ペア';
      }
      // 算出した損益のと入力された損益の符号が一致するか検証
      if (
        formData.position.trim() &&
        formData.entryPrice.toString().trim() &&
        formData.exitPrice.toString().trim() &&
        formData.profitLossPrice.toString().trim()
      ) {
        let sign: number;
        switch (formData.position) {
        case 'long':
          sign = 1;
          break;
        case 'short':
          sign = -1;
          break;
        default:
          throw new Error('ポジションの値が不正です。');
        }
        // 符号が共に正または負のとき変数は正
        const isValidSign = (sign * (formData.exitPrice - formData.entryPrice)) * formData.profitLossPrice > 0;
        if (!isValidSign) {
          newErrors.position = '符号の整合性';
          newErrors.entryPrice = '符号の整合性';
          newErrors.exitPrice = '符号の整合性';
          newErrors.profitLossPrice = '符号の整合性';
        }
      }
    }

    // エラーの状態更新
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // フォームの登録・キャンセル処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // バリデーション通過後の処理
    if (validateForm()) {
      setFormData(prev => ({
        ...prev,
        profitLossPips: calculatePips({
          quoteCurrency: formData.quoteCurrency,
          entryPrice: formData.entryPrice,
          exitPrice: formData.exitPrice,
          position: formData.position
        })
      }));
      setUpdatedFields(prev => ({
        ...prev,
        profitLossPips: true
      }));
    }
  };
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/record/pl');
  };

  // 初回描画時の処理（遷移時）
  useEffect(() => {
    const fetchData = async () => {
      const [newRecord, newMethods] = await Promise.all([
        fetchGETRequestItem<PlRecord>({ endpoint: `/api/pl/read-item?id=${recordId}` }),
        fetchGETRequestItems<Method>({ endpoint: '/api/method/read-all-items' })
      ]);
      // 記録が存在する場合は初期値に設定
      if (newRecord) {
        setIsExistRecord(true);
        setFormData(newRecord);
        resetUpdatedFields();
      }
      // 手法を初期値に設定
      if (newMethods) {
        const methodOptions = newMethods.map(
          method => ({
            value: method.id,
            label: method.name
          })
        );
        setMethodOptions(methodOptions);
        setFormData(prev => ({
          ...prev,
          method: methodOptions[0].value
        }));
      }
    };
    fetchData();
  }, []);

  // formData完成時の処理
  // note: フックは同値で更新しても発火しない（例: updatedFields.profitLossPips）
  useEffect(() => {
    const updateDB = async () => {
      // 依存配列の変数が修正されている場合のみ
      if (
        updatedFields.profitLossPips
      ) {
        // 既存インデックスを更新
        if (isExistRecord) {
          const getUpdatedFormData = () => {
            return (Object.keys(updatedFields) as Array<keyof PlRecord>).reduce((acc, key) => {
              if (updatedFields[key as keyof PlRecord]) {
                acc[key] = formData[key];
              }
              return acc;
            }, {} as Record<string, Item>);
          };
          const updatedFormData = getUpdatedFormData();
          await fetchPostRequest({ endpoint: '/api/pl/update-item', body: { id: recordId, item: updatedFormData } });
        // 新規インデックスを作成
        } else {
          await fetchPostRequest({ endpoint: '/api/pl/create-item', body: { item: formData } });
        }
        router.push('/record/pl');
      }
    };
    updateDB();

  // postProcessAfterValidationで更新される値を依存配列に設定
  }, [updatedFields.profitLossPips]);

  return (
    <div className='px-5 py-5'>
      <form onSubmit={handleSubmit}>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <SelectForm label={'ポジション'} name={'position'} value={formData.position} onChange={handleChangeSelectForm} options={positionOptions} errorMessage={errors.position} />
          </div>
          <div className='flex-1'>
            <SelectForm label={'タイムゾーン'} name={'timeZone'} value={formData.timeZone} onChange={handleChangeSelectForm} options={timeZoneOptions} errorMessage={errors.timeZone} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <TextForm label={'新規'} name={'enteredAt'} value={formData.enteredAt} onChange={handleChangeStringForm} placeholder={'2024-11-01T01:01:00+09:00'} errorMessage={errors.enteredAt} />
          </div>
          <div className='flex-1'>
            <TextForm label={'決済'} name={'exitedAt'} value={formData.exitedAt} onChange={handleChangeStringForm} placeholder={'2024-11-01T01:01:00+09:00'} errorMessage={errors.exitedAt} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <SelectForm label={'基軸'} name={'baseCurrency'} value={formData.baseCurrency} onChange={handleChangeSelectForm} options={currencyOptions} errorMessage={errors.baseCurrency} />
          </div>
          <div className='flex-1'>
            <SelectForm label={'決済'} name={'quoteCurrency'} value={formData.quoteCurrency} onChange={handleChangeSelectForm} options={currencyOptions} errorMessage={errors.quoteCurrency} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <NumberForm label={'新規'} name={'entryPrice'} value={formData.entryPrice.toString()} onChange={handleChangeNumberForm} placeholder={'120.999'} errorMessage={errors.entryPrice} />
          </div>
          <div className='flex-1'>
            <NumberForm label={'決済'} name={'exitPrice'} value={formData.exitPrice.toString()} onChange={handleChangeNumberForm} placeholder={'120.999'} errorMessage={errors.exitPrice} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <NumberForm label={'通貨'} name={'currencyAmount'} value={formData.currencyAmount.toString()} onChange={handleChangeNumberForm} placeholder={'1000'} errorMessage={errors.currencyAmount} />
          </div>
          <div className='flex-1'>
            <NumberForm label={'損益'} name={'profitLossPrice'} value={formData.profitLossPrice.toString()} onChange={handleChangeNumberForm} placeholder={'0.999'} errorMessage={errors.profitLossPrice} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <SelectForm label={'手法'} name={'method'} value={formData.method} onChange={handleChangeSelectForm} options={methodOptions} errorMessage={errors.method} />
          </div>
          <div className='flex-1'>
            <RadioForm label={'デモ'} name={'isDemo'} value={formData.isDemo} onChange={handleChangeRadioForm} options={isDemoOptions} errorMessage={errors.isDemo} />
          </div>
        </div>
        <TextForm label={'メモ'} name={'memo'} value={formData.memo} onChange={handleChangeStringForm} placeholder={'自由記述'} errorMessage={errors.memo} />
        <FormTwinButtons leftLabel={'キャンセル'} rightLabel={'登録'} leftAction={handleCancel} />
      </form>
    </div>
  );
}