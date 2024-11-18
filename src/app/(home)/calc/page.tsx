'use client';

import { useEffect, useState } from 'react';
import { calculateMaxLotSize, calculateRiskReward } from '@/lib/calc';

export default function Home() {
  const [entryPrice, setEntryPrice] = useState<string>('0');
  const [lossCutPrice, setLossCutPrice] = useState<string>('0');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('0');
  const [tradingCapital, setTradingCapital] = useState<string>('0');
  const [currencyAmountPerLot, setCurrencyAmountPerLot] = useState<string>('100000');
  const [maintenanceMarginRatio, setMaintenanceMarginRatio] = useState<string>('20');
  const [jpyCrossRate, setJpyCrossRate] = useState<string>('1');
  const [riskReward, setRiskReward] = useState<number | null>(null);
  const [maxLotSize, setMaxLotSize] = useState<number | null>(null);
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
  }, [
    entryPrice,
    lossCutPrice,
    takeProfitPrice,
    tradingCapital,
    jpyCrossRate,
    currencyAmountPerLot,
    maintenanceMarginRatio,
  ]);
  return (
    <>
      <div className='px-5 py-5'>
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
            <InputField label={'決済通貨/JPY'} value={jpyCrossRate} setValue={(value: string) => setJpyCrossRate(value)} />
          </div>
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
        <p>資金管理に基づく1回分の投入額とすること</p>
        <div className='pt-10'>
          { maxLotSize !== null && <InputField label={'ロット数上限'} value={maxLotSize.toFixed(3)} setValue={(value: string) => setMaxLotSize(parseFloat(value))} /> }
          { riskReward !== null && <InputField label={'リスクリワード'} value={riskReward.toFixed(3)} setValue={(value: string) => setRiskReward(parseFloat(value))} /> }
          { riskReward !== null && riskReward < 3 && <p className='text-attention'>リスクリワードは3倍以上に</p>}
        </div>
      </div>
    </>
  );
}

const InputField = ({ label, value, setValue }: { label: string, value: string, setValue: (value: string) => void }) => {
  return (
    <div className='py-3'>
      <p>{label}</p>
      <input
        type='text'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='block w-full px-2 py-2 rounded-md bg-darkGray text-white focus:outline-none focus:bg-black'
      />
    </div>
  );
};