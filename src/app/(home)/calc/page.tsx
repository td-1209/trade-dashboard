'use client';

import { useEffect, useState } from 'react';
import { calculateMaxLotSize, calculateRiskReward } from '@/lib/calc';

export default function Home() {
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [lossCutPrice, setLossCutPrice] = useState<number>(0);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(0);
  const [tradingCapital, setTradingCapital] = useState<number>(0);
  const [currencyAmountPerLot, setCurrencyAmountPerLot] = useState<number>(100000);
  const [maintenanceMarginRatio, setMaintenanceMarginRatio] = useState<number>(20);
  const [jpyCrossRate, setJpyCrossRate] = useState<number>(1);
  const [riskReward, setRiskReward] = useState<number | null>(null);
  const [maxLotSize, setMaxLotSize] = useState<number | null>(null);
  useEffect(() => {
    const maxlotSize =  calculateMaxLotSize({
      entryPrice: entryPrice,
      lossCutPrice: lossCutPrice,
      tradingCapital: tradingCapital/jpyCrossRate,
      currencyAmountPerLot: currencyAmountPerLot,
      maintenanceMarginRatio: maintenanceMarginRatio
    });
    setMaxLotSize(maxlotSize);
    const riskReward = calculateRiskReward({
      entryPrice: entryPrice,
      lossCutPrice: lossCutPrice,
      takeProfitPrice: takeProfitPrice
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
            <InputField label={'通貨数/ロット数'} value={currencyAmountPerLot.toString()} setValue={(value: number) => setCurrencyAmountPerLot(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'証拠金維持率(%)'} value={maintenanceMarginRatio.toString()} setValue={(value: number) => setMaintenanceMarginRatio(value)} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <InputField label={'決済通貨/JPY'} value={jpyCrossRate.toString()} setValue={(value: number) => setJpyCrossRate(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'利確レート'} value={takeProfitPrice.toString()} setValue={(value: number) =>setTakeProfitPrice(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'注文レート'} value={entryPrice.toString()} setValue={(value: number) => setEntryPrice(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'損切レート'} value={lossCutPrice.toString()} setValue={(value: number) => setLossCutPrice(value)} />
          </div>
        </div>
        <InputField label={'有効証拠金(JPY)'} value={tradingCapital.toString()} setValue={(value: number) => setTradingCapital(value)} />
        <p>資金管理に基づく1回分の投入額とすること</p>
        <div className='pt-10'>
          { maxLotSize !== null && <InputField label={'ロット数上限'} value={maxLotSize.toFixed(3)} setValue={(value: number) => setMaxLotSize(value)} /> }
          { riskReward !== null && <InputField label={'リスクリワード'} value={riskReward.toFixed(3)} setValue={(value: number) => setRiskReward(value)} /> }
          { riskReward !== null && riskReward < 3 && <p className='text-attention'>リスクリワードは3倍以上に</p>}
        </div>
      </div>
    </>
  );
}

const InputField = ({ label, value, setValue }: { label: string, value: string, setValue: (value: number) => void }) => {
  return (
    <div className='py-3'>
      <p>{ label }</p>
      <input
        type='number'
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className='block w-full px-2 py-2 rounded-md bg-darkGray text-white focus:outline-none focus:bg-black'
      />
    </div>
  );
};