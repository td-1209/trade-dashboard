'use client';

import { FormButtons } from '@/components/Button';
import { NumberForm, TextForm } from '@/components/Form';
import { Modal } from '@/components/Modal';
import { useFormData } from '@/hooks/formData';
import {
  convertJSTInputFormatToJSTISOString,
  convertUTCISOStringToJSTInputFormat,
} from '@/lib/calc';
import { createClient } from '@/lib/supabase/client';
import { CF } from '@/types/type';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Home({
  params,
}: {
  params: Promise<{ record_id: string }>;
}) {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.record_id;
      setRecordId(id === 'new' ? null : id);
    };
    getParams();
  }, [params]);

  const now = new Date();
  const initialItem: CF = {
    id: recordId || '',
    quote_currency: 'JPY',
    executed_at: convertUTCISOStringToJSTInputFormat({
      isoString: now.toISOString(),
    }),
    price: 0,
  };
  const [
    formData,
    ,
    {
      setFormData,
      handleChangeStringForm,
      handleChangeNumberForm,
      resetUpdatedFields,
    },
  ] = useFormData<CF>(initialItem);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updateDB = async () => {
      try {
        const supabase = createClient();
        if (recordId) {
          const { error } = await supabase
            .from('cf')
            .update({
              quote_currency: formData.quote_currency,
              executed_at: convertJSTInputFormatToJSTISOString({
                dateTime: formData.executed_at,
              }),
              price: formData.price,
            })
            .eq('id', recordId);
          if (error) {
            console.error('更新エラー:', error);
            return;
          }
        } else {
          const { error } = await supabase.from('cf').insert([
            {
              quote_currency: formData.quote_currency,
              executed_at: convertJSTInputFormatToJSTISOString({
                dateTime: formData.executed_at,
              }),
              price: formData.price,
            },
          ]);
          if (error) {
            console.error('作成エラー:', error);
            return;
          }
        }
        router.push('/cf');
      } catch (error) {
        console.error('データベース操作エラー:', error);
      }
    };
    updateDB();
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/cf');
  };

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('cf').delete().eq('id', recordId);

      if (error) {
        console.error('削除エラー:', error);
        return;
      }

      router.push('/cf');
    } catch (error) {
      console.error('削除処理エラー:', error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!recordId) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: cfData, error } = await supabase
          .from('cf')
          .select('*')
          .eq('id', recordId)
          .single();
        if (error) {
          console.error('データ取得エラー:', error);
          return;
        }
        if (cfData) {
          const formattedRecord: CF = {
            ...cfData,
            executed_at: convertUTCISOStringToJSTInputFormat({
              isoString: cfData.executed_at,
            }),
          };
          setFormData(formattedRecord);
          resetUpdatedFields();
        }
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  if (isLoading) {
    return <></>;
  } else {
    return (
      <form onSubmit={handleSubmit}>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <TextForm
              label={'実行日時'}
              name={'executed_at'}
              value={formData.executed_at}
              onChange={handleChangeStringForm}
            />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>決済通貨</label>
              <div className='bg-darkGray text-white px-3 py-2 rounded-md'>
                JPY
              </div>
            </div>
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <NumberForm
              label={'価格'}
              name={'price'}
              value={formData.price.toString()}
              onChange={handleChangeNumberForm}
            />
          </div>
        </div>
        <FormButtons
          leftLabel={'キャンセル'}
          rightLabel={'登録'}
          leftAction={handleCancel}
          showDelete={!!recordId}
          deleteAction={handleDelete}
        />
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          title={'削除確認'}
          message={'このレコードを削除しますか？この操作は取り消せません。'}
        />
      </form>
    );
  }
}
