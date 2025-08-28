'use client';

import { FormTwinButtons } from '@/components/Button';
import {
  NumberForm,
  SelectForm,
  TextAreaForm,
  TextForm,
} from '@/components/Form';
import { useFormData } from '@/hooks/formData';
import {
  convertJSTInputFormatToJSTISOString,
  convertUTCISOStringToJSTInputFormat,
} from '@/lib/calc';
import { createClient } from '@/lib/supabase/client';
import { Currency, PL, Position } from '@/types/type';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const positionOptions: {
  value: Position;
  label: 'ロング' | 'ショート';
}[] = [
  { value: 'long', label: 'ロング' },
  { value: 'short', label: 'ショート' },
];

const currencyOptions: {
  value: Currency;
  label: Currency;
}[] = [
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

export default function Home({
  params,
}: {
  params: Promise<{ record_id: string }>;
}) {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.record_id;
      setRecordId(id === 'new' ? null : id);
    };
    getParams();
  }, [params]);

  // フォーム入力内容の状態管理
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const initialItem: PL = {
    id: recordId || '',
    base_currency: 'USD',
    quote_currency: 'JPY',
    entered_at: convertUTCISOStringToJSTInputFormat({
      isoString: now.toISOString(),
    }),
    exited_at: convertUTCISOStringToJSTInputFormat({
      isoString: tomorrow.toISOString(),
    }),
    position: 'long',
    entry: 0.999,
    exit: 0.999,
    profit_loss: null,
    reason_detail: '',
    result_detail: '',
    take_profit: 1.0,
    loss_cut: 0.998,
    domain: 'fx',
    method: 'unknown',
    reason_image: 'unknown',
    result_image: 'unknown',
  };
  const [
    formData,
    ,
    {
      setFormData,
      handleChangeStringForm,
      handleChangeNumberForm,
      handleChangeSelectForm,
      resetUpdatedFields,
    },
  ] = useFormData<PL>(initialItem);

  // フォームの登録更新処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updateDB = async () => {
      try {
        const supabase = createClient();
        if (recordId) {
          // 既存レコードの更新
          const { error } = await supabase
            .from('pl')
            .update({
              base_currency: formData.base_currency,
              quote_currency: formData.quote_currency,
              entered_at: convertJSTInputFormatToJSTISOString({
                dateTime: formData.entered_at,
              }),
              exited_at: formData.exited_at
                ? convertJSTInputFormatToJSTISOString({
                    dateTime: formData.exited_at,
                  })
                : null,
              position: formData.position,
              entry: formData.entry,
              exit: formData.exit,
              profit_loss: formData.profit_loss,
              reason_detail: formData.reason_detail,
              result_detail: formData.result_detail,
              take_profit: formData.take_profit,
              loss_cut: formData.loss_cut,
              domain: formData.domain,
              method: formData.method,
              reason_image: formData.reason_image,
              result_image: formData.result_image,
            })
            .eq('id', recordId);
          if (error) {
            console.error('更新エラー:', error);
            return;
          }
        } else {
          // 新規レコードの作成
          const { error } = await supabase.from('pl').insert([
            {
              base_currency: formData.base_currency,
              quote_currency: formData.quote_currency,
              entered_at: convertJSTInputFormatToJSTISOString({
                dateTime: formData.entered_at,
              }),
              exited_at: formData.exited_at
                ? convertJSTInputFormatToJSTISOString({
                    dateTime: formData.exited_at,
                  })
                : null,
              position: formData.position,
              entry: formData.entry,
              exit: formData.exit,
              profit_loss: formData.profit_loss,
              reason_detail: formData.reason_detail,
              result_detail: formData.result_detail,
              take_profit: formData.take_profit,
              loss_cut: formData.loss_cut,
              domain: formData.domain,
              method: formData.method,
              reason_image: formData.reason_image,
              result_image: formData.result_image,
            },
          ]);
          if (error) {
            console.error('作成エラー:', error);
            return;
          }
        }
        // 遷移
        router.push('/pl');
      } catch (error) {
        console.error('データベース操作エラー:', error);
      }
    };
    updateDB();
  };

  // フォームのキャンセル処理
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/pl');
  };

  // 初回描画時の処理（遷移時）
  useEffect(() => {
    if (!recordId) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: plData, error } = await supabase
          .from('pl')
          .select('*')
          .eq('id', recordId)
          .single();
        if (error) {
          console.error('データ取得エラー:', error);
          return;
        }
        if (plData) {
          const formattedRecord: PL = {
            ...plData,
            entered_at: convertUTCISOStringToJSTInputFormat({
              isoString: plData.entered_at,
            }),
            exited_at: plData.exited_at
              ? convertUTCISOStringToJSTInputFormat({
                  isoString: plData.exited_at,
                })
              : null,
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

  // コンポーネント
  if (isLoading) {
    return <></>;
  } else {
    return (
      <form onSubmit={handleSubmit}>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <SelectForm
              label={'ポジション'}
              name={'position'}
              value={formData.position}
              onChange={handleChangeSelectForm}
              options={positionOptions}
            />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <TextForm
              label={'注文日時'}
              name={'entered_at'}
              value={formData.entered_at}
              onChange={handleChangeStringForm}
            />
          </div>
          <div className='flex-1'>
            <TextForm
              label={'決済日時'}
              name={'exited_at'}
              value={formData.exited_at || ''}
              onChange={handleChangeStringForm}
            />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <SelectForm
              label={'基軸通貨'}
              name={'base_currency'}
              value={formData.base_currency}
              onChange={handleChangeSelectForm}
              options={currencyOptions}
            />
          </div>
          <div className='flex-1'>
            <SelectForm
              label={'決済通貨'}
              name={'quote_currency'}
              value={formData.quote_currency || ''}
              onChange={handleChangeSelectForm}
              options={currencyOptions}
            />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <NumberForm
              label={'利確レート'}
              name={'take_profit'}
              value={formData.take_profit.toString()}
              onChange={handleChangeNumberForm}
            />
          </div>
          <div className='flex-1'>
            <NumberForm
              label={'損切レート'}
              name={'loss_cut'}
              value={formData.loss_cut.toString()}
              onChange={handleChangeNumberForm}
            />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <NumberForm
              label={'注文レート'}
              name={'entry'}
              value={formData.entry.toString()}
              onChange={handleChangeNumberForm}
            />
          </div>
          <div className='flex-1'>
            <NumberForm
              label={'決済レート'}
              name={'exit'}
              value={formData.exit?.toString() || ''}
              onChange={handleChangeNumberForm}
            />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <NumberForm
              label={'損益額'}
              name={'profit_loss'}
              value={formData.profit_loss?.toString() || ''}
              onChange={handleChangeNumberForm}
            />
          </div>
        </div>
        <TextAreaForm
          label={'判断'}
          name={'reason_detail'}
          value={formData.reason_detail}
          onChange={handleChangeStringForm}
        />
        <TextAreaForm
          label={'結果'}
          name={'result_detail'}
          value={formData.result_detail || ''}
          onChange={handleChangeStringForm}
        />
        <FormTwinButtons
          leftLabel={'キャンセル'}
          rightLabel={'登録'}
          leftAction={handleCancel}
        />
      </form>
    );
  }
}
