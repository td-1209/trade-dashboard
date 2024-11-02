'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: '市場', path: '/market' },
  { name: '戦略', path: '/strategy' },
  { name: '記録', path: '/record/pl' },
  { name: '分析', path: '/analysis' },
  { name: '手法', path: '/method' },
];

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <>
      {/* fix: 要素見直し・絵文字追加 */}
      <nav className='fixed bottom-0 w-full bg-white border-t'>
        <ul className='flex justify-around'>
          {tabs.map((tab) => (
            <li key={tab.path}>
              <Link href={tab.path}>
                <span className={`p-4 block ${pathname === tab.path ? 'text-secondary' : 'text-lightGray'}`}>
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