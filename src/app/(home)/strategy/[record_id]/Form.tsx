'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item, Strategy } from '@/types/type';
import { FormTwinButtons } from '@/app/(home)/components/Button';
import { TextForm, TextAreaForm } from '@/app/(home)/components/FormParts';
import { fetchGETRequestItem, fetchPostRequest } from '@/lib/request';
import { useFormData } from '@/hooks/formData';
import { validateDateTime } from '@/lib/validate';

interface RecordFormProps {
  recordId: string;
}

export function RecordForm({ recordId }: RecordFormProps) {
  // 初期値
  const initialItem: Strategy = {
    id: recordId,
    memo: '',
    result: '',
    retrospective: '',
    strategy: '',
    week: '2024-11-04_00-00',
  };

  // 型
  type Errors = {[K in keyof Strategy]?: string};
  
  // 状態
  const [
    formData, updatedFields,
    {
      setFormData,
      handleChangeStringForm,
      resetUpdatedFields
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
    const weekError = validateDateTime({ dateTime: formData.week});
    if (weekError) newErrors.week = weekError;
    
    // エラーの状態更新
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // フォームの登録処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const updateDB = async () => {
        // 既存インデックスを更新
        if (isExistRecord) {
          const getUpdatedFormData = () => {
            return (Object.keys(updatedFields) as Array<keyof Strategy>).reduce((acc, key) => {
              if (updatedFields[key as keyof Strategy]) {
                acc[key] = formData[key];
              }
              return acc;
            }, {} as Record<string, Item>);
          };
          const updatedFormData = getUpdatedFormData();
          // console.log(`after-items: ${JSON.stringify(updatedFormData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/strategy/update-item', body: { id: recordId, item: updatedFormData } });
        
        // 新規インデックスを作成
        } else {
          // console.log(`after-items: ${JSON.stringify(formData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/strategy/create-item', body: { item: formData } });
        }

        // 遷移
        router.push('/strategy');
      };
      updateDB();
    }
  };

  // フォームのキャンセル処理
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/strategy');
  };

  // 初回描画時の処理（遷移時）
  useEffect(() => {
    const fetchData = async () => {
      const newStrategies = await fetchGETRequestItem<Strategy>({ endpoint: `/api/strategy/read-item?id=${recordId}` });
      // 記録が存在する場合は初期値に設定
      if (newStrategies) {
        setIsExistRecord(true);
        setFormData(newStrategies);
        resetUpdatedFields();
      }
      setIsLoading(false);
      // console.log(`before-items: ${JSON.stringify(newStrategies, null, 2)}`);
    };
    fetchData();
  }, []);

  // コンポーネント
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
              <TextForm label={'開始日'} name={'week'} value={formData.week} onChange={handleChangeStringForm} errorMessage={errors.week} />
            </div>
          </div>
          <TextAreaForm label={'戦略'} name={'strategy'} value={formData.strategy} onChange={handleChangeStringForm} errorMessage={errors.strategy} height={400} />
          <TextAreaForm label={'結果'} name={'result'} value={formData.result} onChange={handleChangeStringForm} errorMessage={errors.result} />
          <TextAreaForm label={'ふりかえり'} name={'retrospective'} value={formData.retrospective} onChange={handleChangeStringForm} errorMessage={errors.retrospective} />
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