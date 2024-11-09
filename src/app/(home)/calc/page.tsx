'use client';

import { useEffect, useState } from 'react';
import { calculateMaxLotSize, calculateRequiredMargin } from '@/lib/calc';


export default function Home() {
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [exitPrice, setExitPrice] = useState<number>(0);
  const [currencyAmountPerLot, setCurrencyAmountPerLot] = useState<number>(100000);
  const [maintenanceMarginRatio, setMaintenanceMarginRatio] = useState<number>(20);
  const [lotSize, setLotSize] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(1000);
  const [tradingCapital, setTradingCapital] = useState<number>(0);
  const [maxLotSize, setMaxLotSize] = useState<number | null>(null);
  const [requiredMargin, setRequiredMargin] = useState<number | null>(null);
  useEffect(() => {
    const maxlotSize =  calculateMaxLotSize({
      tradingCapital: tradingCapital,
      entryPrice: entryPrice,
      exitPrice: exitPrice,
      currencyAmountPerLot: currencyAmountPerLot,
      maintenanceMarginRatio: maintenanceMarginRatio
    });
    setMaxLotSize(maxlotSize);
    const requiredMargin =  calculateRequiredMargin({
      entryPrice: entryPrice,
      currencyAmountPerLot: currencyAmountPerLot,
      lotSize: lotSize,
      leverage: leverage
    });
    setRequiredMargin(requiredMargin);
  }, [
    entryPrice,
    exitPrice,
    currencyAmountPerLot,
    maintenanceMarginRatio,
    lotSize,
    leverage,
    tradingCapital
  ]);
  return (
    <>
      <div className='px-5 py-5'>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <InputField label={'通貨/ロット'} value={currencyAmountPerLot.toString()} setValue={(value: number) => setCurrencyAmountPerLot(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'維持率(%)'} value={maintenanceMarginRatio.toString()} setValue={(value: number) => setMaintenanceMarginRatio(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'レバレッジ'} value={leverage.toString()} setValue={(value: number) => setLeverage(value)} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <InputField label={'注文額'} value={entryPrice.toString()} setValue={(value: number) => setEntryPrice(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'決済額'} value={exitPrice.toString()} setValue={(value: number) => setExitPrice(value)} />
          </div>
        </div>
        <div className='flex space-x-5'>
          <div className='flex-1'>
            <InputField label={'ロット'} value={lotSize.toString()} setValue={(value: number) => setLotSize(value)} />
          </div>
          <div className='flex-1'>
            <InputField label={'有効証拠金'} value={tradingCapital.toString()} setValue={(value: number) => setTradingCapital(value)} />
          </div>
        </div>
        <div className='flex space-x-5 pt-10'>
          { maxLotSize !== null && (<p className='text-xl'>ロット上限： {maxLotSize}</p>) }
        </div>
        <div className='flex space-x-5'>
          { requiredMargin !== null && (<p className='text-xl'>必要証拠金： {requiredMargin}</p>) }
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