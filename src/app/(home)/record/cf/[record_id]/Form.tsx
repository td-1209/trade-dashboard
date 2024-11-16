'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item, CfRecord, TimeZone, Currencies } from '@/types/type';
import { FormTwinButtons } from '@/app/(home)/components/Button';
import { TextForm, NumberForm, SelectForm } from '@/app/(home)/components/FormParts';
import { fetchGETRequestItem, fetchPostRequest } from '@/lib/request';
import { useFormData } from '@/hooks/formData';
import { validateDateTime, validateInteger } from '@/lib/validate';

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
  { value: 'JPY', label: 'JPY' },
  { value: 'USD', label: 'USD' },
];

interface RecordFormProps {
  recordId: string;
}

export function RecordForm({ recordId }: RecordFormProps) {
  // 初期値
  const initialItem: CfRecord = {
    id: recordId,
    executedAt: '2024-11-01_01-01',
    timeZone: '+09:00',
    quoteCurrency: 'JPY',
    price: 10000,
    bonus: 10000,
    memo: '',
  };

  // 型
  type Errors = {[K in keyof CfRecord]?: string};
  
  // 状態
  const [
    formData, updatedFields,
    {
      setFormData,
      handleChangeStringForm, handleChangeNumberForm,
      handleChangeSelectForm, resetUpdatedFields
    }
  ] = useFormData(initialItem);
  const [isExistRecord, setIsExistRecord] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();

  // バリデーション
  const validateForm = () => {
    const newErrors: Errors = {};
    
    // 時間系
    const executedAtError = validateDateTime({ dateTime: formData.executedAt});
    if (executedAtError) newErrors.executedAt = executedAtError;
    
    // 数字系
    const priceError = validateInteger({ name: 'price', value: formData.price.toString(), setFormData: setFormData});
    const bonusError = validateInteger({ name: 'bonus', value: formData.bonus.toString(), setFormData: setFormData});
    if (priceError) newErrors.price = priceError;
    if (bonusError) newErrors.bonus = bonusError;

    // エラーの状態更新
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // フォームの登録・キャンセル処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const updateDB = async () => {
        // 既存インデックスを更新
        if (isExistRecord) {
          const getUpdatedFormData = () => {
            return (Object.keys(updatedFields) as Array<keyof CfRecord>).reduce((acc, key) => {
              if (updatedFields[key as keyof CfRecord]) {
                acc[key] = formData[key];
              }
              return acc;
            }, {} as Record<string, Item>);
          };
          const updatedFormData = getUpdatedFormData();
          // console.log(`after-items: ${JSON.stringify(updatedFormData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/cf/update-item', body: { id: recordId, item: updatedFormData } });
        // 新規インデックスを作成
        } else {
          // console.log(`after-items: ${JSON.stringify(formData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/cf/create-item', body: { item: formData } });
        }
        router.push('/record/cf');
      };
      updateDB();
    }
  };
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/record/cf');
  };

  // 初回描画時の処理（遷移時）
  useEffect(() => {
    const fetchData = async () => {
      const newRecord = await fetchGETRequestItem<CfRecord>({ endpoint: `/api/cf/read-item?id=${recordId}` });
      // 記録が存在する場合は初期値に設定
      if (newRecord) {
        setIsExistRecord(true);
        setFormData(newRecord);
        resetUpdatedFields();
      }
      setIsLoading(false);
      // console.log(`before-items: ${JSON.stringify(newRecord, null, 2)}`);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className='px-5 py-5'>
        <ItemLoading />
      </div>
    );
  } else {
    return (
      <div className='px-5 py-5'>
        <form onSubmit={handleSubmit}>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <TextForm label={'実行日'} name={'executedAt'} value={formData.executedAt} onChange={handleChangeStringForm} errorMessage={errors.executedAt} />
            </div>
            <div className='flex-1'>
              <SelectForm label={'タイムゾーン'} name={'timeZone'} value={formData.timeZone} onChange={handleChangeSelectForm} options={timeZoneOptions} errorMessage={errors.timeZone} />
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <SelectForm label={'決済通貨'} name={'quoteCurrency'} value={formData.quoteCurrency} onChange={handleChangeSelectForm} options={currencyOptions} errorMessage={errors.quoteCurrency} />
            </div>
            <div className='flex-1'>
              <NumberForm label={'金額'} name={'price'} value={formData.price.toString()} onChange={handleChangeNumberForm} errorMessage={errors.price} />
            </div>
            <div className='flex-1'>
              <NumberForm label={'ボーナス額'} name={'bonus'} value={formData.bonus.toString()} onChange={handleChangeNumberForm} errorMessage={errors.price} />
            </div>
          </div>
          <TextForm label={'メモ'} name={'memo'} value={formData.memo} onChange={handleChangeStringForm} errorMessage={errors.memo} />
          <FormTwinButtons leftLabel={'キャンセル'} rightLabel={'登録'} leftAction={handleCancel} />
        </form>
      </div>
    );
  }
}

const ItemLoading = () => {
  return(
    <></>
  );
};