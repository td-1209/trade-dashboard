'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  StrategyIconButton,
  ProfitLossIconButton,
  CashFlowIconButton,
  AnalysisIconButton,
} from '@/app/(home)/components/Button';

const tabs = [
  { name: '出入', path: '/record/cf', icon: <CashFlowIconButton /> },
  { name: '損益', path: '/record/pl', icon: <ProfitLossIconButton /> },
  { name: '分析', path: '/analysis', icon: <AnalysisIconButton /> },
  { name: '戦略', path: '/strategy', icon: <StrategyIconButton /> },
];

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <>
      <nav className='fixed bottom-0 w-full bg-cancelButtonBG'>
        <ul className='flex justify-around'>
          {tabs.map((tab) => (
            <li key={tab.path}>
              <Link href={tab.path}>
                <span className={`pt-3 pb-7 flex flex-col items-center justify-center ${pathname === tab.path ? 'text-secondary' : 'text-lightGray'}`}>
                  {tab.icon}
                  {/* {tab.name} */}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};