'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item, PlRecord, Position, TimeZone, Currencies, Method } from '@/types/type';
import { FormTwinButtons } from '@/app/(home)/components/Button';
import { TextForm, NumberForm, SelectForm, RadioForm } from '@/app/(home)/components/FormParts';
import { calculateMaxLotSize, calculatePips, calculateRiskReward } from '@/lib/calc';
import { fetchGETRequestItem, fetchGETRequestItems, fetchPostRequest } from '@/lib/request';
import { useFormData } from '@/hooks/formData';
import { validateDateTime, validateFloat, validateInteger } from '@/lib/validate';
import { sortItems } from '@/lib/dynamodb';

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

const isDemoOptions = [
  { value: true, label: 'オン' },
  { value: false, label: 'オフ' }
];

const isSettledOptions = [
  { value: true, label: '決済完了' },
  { value: false, label: '取引中' }
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
    timeZone: '+09:00',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    currencyLot: 0.01,
    currencyAmountPerLot: 100000,
    position: 'long',
    initialUpperExitPrice: 0.999,
    initialLowerExitPrice: 0.999,
    entryPrice: 0.999,
    exitPrice: 0.999,
    profitLossPrice: 999,
    profitLossPips: 0.999,
    method: '',
    isDemo: false,
    isSettled: false,
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
  const [isLoading, setIsLoading] = useState(true);
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
    const initialUpperExitPriceError = validateFloat({ name: 'initialUpperExitPrice', value: formData.initialUpperExitPrice.toString(), setFormData: setFormData});
    const initialLowerExitPriceError = validateFloat({ name: 'initialLowerExitPrice', value: formData.initialLowerExitPrice.toString(), setFormData: setFormData});
    const entryPriceError = validateFloat({ name: 'entryPrice', value: formData.entryPrice.toString(), setFormData: setFormData});
    const exitPriceError = validateFloat({ name: 'exitPrice', value: formData.exitPrice.toString(), setFormData: setFormData});
    const currencyLotError = validateFloat({ name: 'currencyLot', value: formData.currencyLot.toString(), setFormData: setFormData});
    const currencyAmountPerLotError = validateInteger({ name: 'currencyAmountPerLot', value: formData.currencyAmountPerLot.toString(), setFormData: setFormData});
    const profitLossPriceError = validateInteger({ name: 'profitLossPrice', value: formData.profitLossPrice.toString(), setFormData: setFormData});
    if (initialUpperExitPriceError) newErrors.initialUpperExitPrice = initialUpperExitPriceError;
    if (initialLowerExitPriceError) newErrors.initialLowerExitPrice = initialLowerExitPriceError;
    if (entryPriceError) newErrors.entryPrice = entryPriceError;
    if (exitPriceError) newErrors.exitPrice = exitPriceError;
    if (currencyLotError) newErrors.currencyLot = currencyLotError;
    if (currencyAmountPerLotError) newErrors.currencyAmountPerLot = currencyAmountPerLotError;
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
      // 高い方の決済額＞注文額＞低い方の決済額
      if (
        formData.entryPrice.toString().trim() &&
        formData.initialUpperExitPrice.toString().trim() &&
        formData.initialLowerExitPrice.toString().trim()
      ) {
        if (formData.entryPrice > formData.initialUpperExitPrice) {
          newErrors.entryPrice = '注文/決済の大小';
          newErrors.initialUpperExitPrice = '注文/決済の大小';
        }
        if (formData.entryPrice < formData.initialLowerExitPrice) {
          newErrors.entryPrice = '注文/決済の大小';
          newErrors.initialLowerExitPrice = '注文/決済の大小';
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
      // 手法が存在する場合は手法リストを更新
      if (newMethods) {
        const sortedNewMethods = sortItems<Method>({ items: newMethods, keyName: 'name', type: 'ASC'});
        const methodOptions = sortedNewMethods.map(
          method => ({
            value: method.id,
            label: method.name
          })
        );
        setMethodOptions(methodOptions);
        setFormData(prev => ({...prev, method: methodOptions[0].value}));
        resetUpdatedFields();
      }
      // 記録が存在する場合は全ての初期値を更新
      if (newRecord) {
        setIsExistRecord(true);
        setFormData(newRecord);
        resetUpdatedFields();
      }
      // データロードの終了を宣言
      setIsLoading(false);
      // console.log(`before-items: ${JSON.stringify(newRecord, null, 2)}`);
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
          // console.log(`after-items: ${JSON.stringify(updatedFormData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/pl/update-item', body: { id: recordId, item: updatedFormData } });
        // 新規インデックスを作成
        } else {
          // console.log(`after-items: ${JSON.stringify(formData, null, 2)}`);
          await fetchPostRequest({ endpoint: '/api/pl/create-item', body: { item: formData } });
        }
        router.push('/record/pl');
      }
    };
    updateDB();

  // postProcessAfterValidationで更新される値を依存配列に設定
  }, [updatedFields.profitLossPips]);

  // ロット上限などの計算処理系
  const [maintenanceMarginRatio, setMaintenanceMarginRatio] = useState<string>('20');
  const [versusJpyPrice, setVersusJpyPrice] = useState<string>('1');
  const [tradingCapital, setTradingCapital] = useState<string>('0');
  const [maxLotSize, setMaxLotSize] = useState<string | null>(null);
  const [takeProfitPips, setTakeProfitPips] = useState<string | null>(null);
  const [lossCutPips, setLossCutPips] = useState<string | null>(null);
  const [riskReward, setRiskReward] = useState<string | null>(null);
  const handleChangeMaintenanceMarginRatio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMaintenanceMarginRatio(value);
  };
  const handleChangeVersusJpyPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setVersusJpyPrice(value);
  };
  const handleChangeTradingCapital = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTradingCapital(value);
  };
  useEffect(() => {
    let takeProfitPrice: number;
    let lossCutPrice: number;
    switch (formData.position) {
    case 'long':
      takeProfitPrice = formData.initialUpperExitPrice;
      lossCutPrice = formData.initialLowerExitPrice;
      break;
    case 'short':
      takeProfitPrice = formData.initialLowerExitPrice;
      lossCutPrice = formData.initialUpperExitPrice;
      break;
    }
    const maxLotSize =  calculateMaxLotSize({
      entryPrice: formData.entryPrice,
      lossCutPrice: lossCutPrice,
      tradingCapital: parseFloat(tradingCapital)/parseFloat(versusJpyPrice),
      currencyAmountPerLot: formData.currencyAmountPerLot,
      maintenanceMarginRatio: parseFloat(maintenanceMarginRatio)
    });
    setMaxLotSize(maxLotSize.toFixed(2));
    const takeProfitPips = calculatePips({
      quoteCurrency: formData.quoteCurrency,
      entryPrice: formData.entryPrice,
      exitPrice: takeProfitPrice,
      position: formData.position
    });
    setTakeProfitPips(takeProfitPips.toFixed(2));
    const lossCutPips = calculatePips({
      quoteCurrency: formData.quoteCurrency,
      entryPrice: formData.entryPrice,
      exitPrice: lossCutPrice,
      position: formData.position
    });
    setLossCutPips(lossCutPips.toFixed(2));
    const riskReward = calculateRiskReward({
      entryPrice: formData.entryPrice,
      lossCutPrice: lossCutPrice,
      takeProfitPrice: takeProfitPrice
    });
    setRiskReward(riskReward.toFixed(2));
  }, [
    formData.entryPrice,
    formData.quoteCurrency,
    formData.position,
    formData.initialUpperExitPrice,
    formData.initialLowerExitPrice,
    formData.currencyAmountPerLot,
    maintenanceMarginRatio,
    versusJpyPrice,
    tradingCapital,
  ]);

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
              <SelectForm label={'ポジション'} name={'position'} value={formData.position} onChange={handleChangeSelectForm} options={positionOptions} errorMessage={errors.position} />
            </div>
            <div className='flex-1'>
              <SelectForm label={'タイムゾーン'} name={'timeZone'} value={formData.timeZone} onChange={handleChangeSelectForm} options={timeZoneOptions} errorMessage={errors.timeZone} />
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <TextForm label={'注文日時'} name={'enteredAt'} value={formData.enteredAt} onChange={handleChangeStringForm} errorMessage={errors.enteredAt} />
            </div>
            <div className='flex-1'>
              <TextForm label={'決済日時'} name={'exitedAt'} value={formData.exitedAt} onChange={handleChangeStringForm} errorMessage={errors.exitedAt} />
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <SelectForm label={'基軸通貨'} name={'baseCurrency'} value={formData.baseCurrency} onChange={handleChangeSelectForm} options={currencyOptions} errorMessage={errors.baseCurrency} />
            </div>
            <div className='flex-1'>
              <SelectForm label={'決済通貨'} name={'quoteCurrency'} value={formData.quoteCurrency} onChange={handleChangeSelectForm} options={currencyOptions} errorMessage={errors.quoteCurrency} />
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <NumberForm label={'予定決済レート(高)'} name={'initialUpperExitPrice'} value={formData.initialUpperExitPrice.toString()} onChange={handleChangeNumberForm} errorMessage={errors.initialUpperExitPrice} />
            </div>
            <div className='flex-1'>
              <NumberForm label={'予定決済レート(低)'} name={'initialLowerExitPrice'} value={formData.initialLowerExitPrice.toString()} onChange={handleChangeNumberForm} errorMessage={errors.initialLowerExitPrice} />
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <NumberForm label={'実績注文レート'} name={'entryPrice'} value={formData.entryPrice.toString()} onChange={handleChangeNumberForm} errorMessage={errors.entryPrice} />
            </div>
            <div className='flex-1'>
              <NumberForm label={'実績決済レート'} name={'exitPrice'} value={formData.exitPrice.toString()} onChange={handleChangeNumberForm} errorMessage={errors.exitPrice} />
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <NumberForm label={'通貨数/ロット'} name={'currencyAmountPerLot'} value={formData.currencyAmountPerLot.toString()} onChange={handleChangeNumberForm} errorMessage={errors.currencyAmountPerLot} />
            </div>
            <div className='flex-1'>
              <NumberForm label={`ロット(<${maxLotSize})`} name={'currencyLot'} value={formData.currencyLot.toString()} onChange={handleChangeNumberForm} errorMessage={errors.currencyLot} />
            </div>
            <div className='flex-1'>
              <NumberForm label={'損益額'} name={'profitLossPrice'} value={formData.profitLossPrice.toString()} onChange={handleChangeNumberForm} errorMessage={errors.profitLossPrice} />
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
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <NumberForm label={'証拠金維持率%'} name={'maintenanceMarginRatio'} value={maintenanceMarginRatio.toString()} onChange={handleChangeMaintenanceMarginRatio} />
            </div>
            <div className='flex-1'>
              <NumberForm label={'決済通貨/JPY'} name={'versusJpyPrice'} value={versusJpyPrice.toString()} onChange={handleChangeVersusJpyPrice} />
            </div>
            <div className='flex-1'>
              <NumberForm label={'有効証拠金円'} name={'tradingCapital'} value={tradingCapital.toString()} onChange={handleChangeTradingCapital} />
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              <ItemDisplay label={'リスクリワード'} value={ riskReward !== null && riskReward.toString() } message={ riskReward !== null && parseFloat(riskReward) < 3 && '3倍以上' } />
            </div>
            <div className='flex-1'>
              <ItemDisplay label={'利確pips'} value={ takeProfitPips !== null && takeProfitPips.toString() } message= { takeProfitPips !== null && Math.abs(parseFloat(takeProfitPips)) < 30 && 'リワード不足' } />
            </div>
            <div className='flex-1'>
              <ItemDisplay label={'損切pips'} value={ lossCutPips !== null && lossCutPips.toString() } message= { lossCutPips !== null && Math.abs(parseFloat(lossCutPips)) > 10 && 'リスク過剰' } />
            </div>
          </div>
          <TextForm label={'メモ'} name={'memo'} value={formData.memo} onChange={handleChangeStringForm} errorMessage={errors.memo} />
          <RadioForm label={'ステータス'} name={'isSettled'} value={formData.isSettled} onChange={handleChangeRadioForm} options={isSettledOptions} errorMessage={errors.isSettled} />
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

interface ItemDisplayProps {
  label: string;
  value:string | false;
  message: string | false; 
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({ label, value, message }) => {
  return (
    <div className='py-1'>
      <label className='block text-sm text-lightGray'>
        {label}
      </label>
      <p className='block w-full px-2 py-2 rounded-md bg-black placeholder:text-lightGray focus:outline-none focus:bg-black text-white'>
        {value}
      </p>
      <div>
        {message? (
          <p className='text-sm text-negative'>{message}</p>
        ) : (
          <p className='text-sm text-transparent'>&#8203;</p>
        )}
      </div>
    </div>
  );
};