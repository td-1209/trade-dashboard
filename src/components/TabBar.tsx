'use client';

import {
  AnalysisIconButton,
  CashFlowIconButton,
  ProfitLossIconButton,
} from '@/components/Button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: '損益', path: '/', icon: <ProfitLossIconButton /> },
  { name: '出入', path: '/cf', icon: <CashFlowIconButton /> },
  { name: '分析', path: '/report', icon: <AnalysisIconButton /> },
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
                <span
                  className={`pt-3 pb-7 flex flex-col items-center justify-center ${
                    pathname === tab.path ? 'text-secondary' : 'text-lightGray'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};
