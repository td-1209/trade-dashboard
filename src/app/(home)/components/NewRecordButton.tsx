'use client';

import { useRouter } from 'next/navigation';
import { generateULID } from '@/lib/calc';
import { SingleButton } from '@/app/(home)/components/Button';

export const NewRecordButton = ({prefix, path}: {prefix: string, path: string}) => {
  const router = useRouter();
  const handleClick = () => {
    const newId = generateULID(prefix);
    router.push(`${path}${newId}`);
  };
  return <SingleButton label='新規登録' action={handleClick} />;
};
