'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item, PlRecord, Method } from '@/types/type';
import { FormTwinButtons } from '@/app/(home)/components/Button';
import { TextForm, TextAreaForm } from '@/app/(home)/components/FormParts';
import { fetchGETRequestItem, fetchPostRequest } from '@/lib/request';
import { useFormData } from '@/hooks/formData';

interface RecordFormProps {
  recordId: string;
}

export function RecordForm({ recordId }: RecordFormProps) {
  // 初期値
  const initialItem: Method = {
    id: recordId,
    name: '',
    detail: '',
    memo: '' 
  };
  
  // 型
  type Errors = {[K in keyof PlRecord]?: string};
  
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
            return (Object.keys(updatedFields) as Array<keyof Method>).reduce((acc, key) => {
              if (updatedFields[key as keyof Method]) {
                acc[key] = formData[key];
              }
              return acc;
            }, {} as Record<string, Item>);
          };
          const updatedFormData = getUpdatedFormData();
          // console.log(`after-items: ${JSON.stringify(updatedFormData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/method/update-item', body: { id: recordId, item: updatedFormData } });
        // 新規インデックスを作成
        } else {
          // console.log(`after-items: ${JSON.stringify(formData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/method/create-item', body: { item: formData } });
        }
        router.push('/method');
      };
      updateDB();
    }
  };
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/method');
  };

  // 初回描画時の処理（遷移時）
  useEffect(() => {
    const fetchData = async () => {
      const newMethods = await fetchGETRequestItem<Method>({ endpoint: `/api/method/read-item?id=${recordId}` });
      // 記録が存在する場合は初期値に設定
      if (newMethods) {
        setIsExistRecord(true);
        setFormData(newMethods);
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
          <TextForm label={'名前'} name={'name'} value={formData.name} onChange={handleChangeStringForm} errorMessage={errors.name} />
          <TextAreaForm label={'詳細'} name={'detail'} value={formData.detail} onChange={handleChangeStringForm} errorMessage={errors.detail} height={400} />
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