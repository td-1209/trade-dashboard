'use client';

import { useEffect, useState } from 'react';
import { calculateMaxLotSize, calculatePips, calculateRiskReward } from '@/lib/calc';
import { Currencies, Position } from '@/types/type';

const currencyOptions = [
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

const positionOptions = [
  { value: 'long', label: 'ロング' },
  { value: 'short', label: 'ショート' },
];

export default function Home() {
  const [entryPrice, setEntryPrice] = useState<string>('0');
  const [position, setPosition] = useState<string>('long');
  const [quoteCurrency, setQuoteCurrency] = useState<string>('JPY');
  const [lossCutPrice, setLossCutPrice] = useState<string>('0');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('0');
  const [tradingCapital, setTradingCapital] = useState<string>('0');
  const [currencyAmountPerLot, setCurrencyAmountPerLot] = useState<string>('100000');
  const [maintenanceMarginRatio, setMaintenanceMarginRatio] = useState<string>('20');
  const [jpyCrossRate, setJpyCrossRate] = useState<string>('1');
  const [riskReward, setRiskReward] = useState<number | null>(null);
  const [maxLotSize, setMaxLotSize] = useState<number | null>(null);
  const [takeProfitPips, setTakeProfitPips] = useState<number | null>(null);
  const [lossCutPips, setLossCutPips] = useState<number | null>(null);
  useEffect(() => {
    const maxlotSize =  calculateMaxLotSize({
      entryPrice: parseFloat(entryPrice),
      lossCutPrice: parseFloat(lossCutPrice),
      tradingCapital: parseFloat(tradingCapital)/parseFloat(jpyCrossRate),
      currencyAmountPerLot: parseFloat(currencyAmountPerLot),
      maintenanceMarginRatio: parseFloat(maintenanceMarginRatio)
    });
    setMaxLotSize(maxlotSize);
    const riskReward = calculateRiskReward({
      entryPrice: parseFloat(entryPrice),
      lossCutPrice: parseFloat(lossCutPrice),
      takeProfitPrice: parseFloat(takeProfitPrice)
    });
    setRiskReward(riskReward);
    const takeProfitPips = calculatePips({
      quoteCurrency: quoteCurrency as Currencies,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(takeProfitPrice),
      position: position as Position
    });
    setTakeProfitPips(Math.abs(takeProfitPips));
    const lossCutPips = calculatePips({
      quoteCurrency: quoteCurrency as Currencies,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(lossCutPrice),
      position: position as Position
    });
    setLossCutPips(Math.abs(lossCutPips));
  }, [
    entryPrice,
    quoteCurrency,
    position,
    lossCutPrice,
    takeProfitPrice,
    tradingCapital,
    jpyCrossRate,
    currencyAmountPerLot,
    maintenanceMarginRatio,
  ]);
  return (
    <>
      <div className='px-5 pt-5 pb-20'>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <InputField label={'通貨数/ロット数'} value={currencyAmountPerLot} setValue={(value: string) => setCurrencyAmountPerLot(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'証拠金維持率(%)'} value={maintenanceMarginRatio} setValue={(value: string) => setMaintenanceMarginRatio(value)} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <SelectField label={'ポジション'} value={position} setValue={setPosition} options={positionOptions} />
          </div>
          <div className='flex-1'>
            <SelectField label={'決済通貨'} value={quoteCurrency} setValue={setQuoteCurrency} options={currencyOptions} />
          </div>
          <div className='flex-1'>
            <InputField label={'決済通貨/JPY'} value={jpyCrossRate} setValue={(value: string) => setJpyCrossRate(value)} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <InputField label={'利確レート'} value={takeProfitPrice} setValue={(value: string) =>setTakeProfitPrice(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'注文レート'} value={entryPrice} setValue={(value: string) => setEntryPrice(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'損切レート'} value={lossCutPrice} setValue={(value: string) => setLossCutPrice(value)} />
          </div>
        </div>
        <InputField label={'有効証拠金(JPY)'} value={tradingCapital} setValue={(value: string) => setTradingCapital(value)} />
        <div className='pt-10'>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              { maxLotSize !== null && <InputField label={'ロット数上限'} value={maxLotSize.toFixed(3)} setValue={(value: string) => setMaxLotSize(parseFloat(value))} /> }
            </div>
            <div className='flex-1'>
              { riskReward !== null && <InputField label={'リスクリワード'} value={riskReward.toFixed(3)} setValue={(value: string) => setRiskReward(parseFloat(value))} /> }
              { riskReward !== null && riskReward < 3 && <p className='text-sm text-attention'>リスクリワード3倍以上</p>}
            </div>
          </div>
          <div className='flex space-x-5'>
            <div className='flex-1'>
              { takeProfitPips !== null && <InputField label={'利確pips'} value={takeProfitPips.toString()} setValue={(value: string) => setTakeProfitPips(parseFloat(value))} /> }
              { takeProfitPips !== null && takeProfitPips < 30 && <p className='text-sm text-attention'>リワードが不足</p>}
            </div>
            <div className='flex-1'>
              { lossCutPips !== null && <InputField label={'損切pips'} value={lossCutPips.toString()} setValue={(value: string) => setLossCutPips(parseFloat(value))} /> }
              { lossCutPips !== null && lossCutPips > 10 && <p className='text-sm text-attention'>リスクが過剰</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const InputField = ({ label, value, setValue }: { label: string, value: string, setValue: (value: string) => void }) => {
  return (
    <div className='py-3'>
      <p className='text-sm'>{label}</p>
      <input
        type='text'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='block w-full px-2 py-2 rounded-md bg-darkGray text-white focus:outline-none focus:bg-black'
      />
    </div>
  );
};

type Option = {
  value: string;
  label: string;
};

const SelectField = ({ 
  label, 
  value, 
  setValue, 
  options 
}: { 
  label: string, 
  value: string, 
  setValue: (value: string) => void,
  options: Option[]
}) => {
  return (
    <div className='py-3'>
      <p className='text-sm'>{label}</p>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='block w-full px-2 py-2 rounded-md bg-darkGray text-white focus:outline-none focus:bg-black'
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};