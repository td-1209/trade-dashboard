'use client';
import React from 'react';

interface SingleButtonType {
  label: string;
  action: () => void;
}

export const SingleButton: React.FC<SingleButtonType> = ({ label, action }) => {
  return (
    <button
      onClick={action}
      className='w-[120px] rounded-lg py-2 text-cancelButtonText bg-cancelButtonBG hover:bg-cancelButtonBGTrans active:bg-cancelButtonBGActive active:transform active:scale-99 transition-all duration-200'
    >
      {label}
    </button>
  );
};

interface TwinButtonsType {
  leftLabel: string;
  rightLabel: string;
  leftAction: () => void;
  rightAction: () => void;
}

export const TwinButtons: React.FC<TwinButtonsType> = ({
  leftLabel,
  rightLabel,
  leftAction,
  rightAction,
}) => {
  return (
    <div className='flex justify-between w-full px-5'>
      <button
        onClick={leftAction}
        className='w-[120px] rounded-lg py-2 text-cancelButtonText bg-cancelButtonBG hover:bg-cancelButtonBGTrans active:bg-cancelButtonBGActive active:transform active:scale-99 transition-all duration-200'
      >
        {leftLabel}
      </button>
      <button
        onClick={rightAction}
        className='w-[120px] rounded-lg py-2 text-secondaryButtonText bg-secondaryButtonBG hover:bg-secondaryButtonBGTrans active:bg-secondaryButtonBGActive active:transform active:scale-99 transition-all duration-200'
      >
        {rightLabel}
      </button>
    </div>
  );
};

interface FormButtonsType {
  leftLabel: string;
  rightLabel: string;
  leftAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deleteLabel?: string;
  deleteAction?: () => void;
  showDelete?: boolean;
}

export const FormButtons: React.FC<FormButtonsType> = ({
  leftLabel,
  rightLabel,
  leftAction,
  deleteLabel = '削除',
  deleteAction,
  showDelete = false,
}) => {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between w-full gap-2'>
        {showDelete && deleteAction && (
          <button
            type='button'
            onClick={deleteAction}
            className='w-[120px] rounded-lg py-2 text-attentionButtonText bg-attentionButtonBG hover:bg-attentionButtonBGTrans active:bg-attentionButtonBGActive active:transform active:scale-99 transition-all duration-200'
          >
            {deleteLabel}
          </button>
        )}
        <button
          onClick={leftAction}
          className='w-[120px] rounded-lg py-2 text-cancelButtonText bg-cancelButtonBG hover:bg-cancelButtonBGTrans active:bg-cancelButtonBGActive active:transform active:scale-99 transition-all duration-200'
        >
          {leftLabel}
        </button>
        <button
          type='submit'
          className='w-[120px] rounded-lg py-2 text-secondaryButtonText bg-secondaryButtonBG hover:bg-secondaryButtonBGTrans active:bg-secondaryButtonBGActive active:transform active:scale-99 transition-all duration-200'
        >
          {rightLabel}
        </button>
      </div>
    </div>
  );
};

interface DummyButtonProps {
  label: string;
}

export const DummyButton: React.FC<DummyButtonProps> = ({ label }) => {
  return (
    <button className='w-[120px] rounded-lg py-2 mx-0 text-normalButtonText bg-normalButtonBG hover:bg-normalButtonBGTrans active:bg-normalButtonBGActive active:transform active:scale-99 transition-all duration-200'>
      {label}
    </button>
  );
};

// interface NewRecordButtonProps {
//   prefix: string;
//   path: string;
// }

// export const NewRecordButton = ({ prefix, path }: NewRecordButtonProps) => {
//   const router = useRouter();
//   const handleClick = () => {
//     const newId = generateULID(prefix);
//     router.push(`${path}${newId}`);
//   };
//   return <SingleButton label='新規登録' action={handleClick} />;
// };

export const MarketIconButton = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1.5em'
      height='1.5em'
      viewBox='0 0 24 24'
    >
      <path
        fill='currentColor'
        d='M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2'
      ></path>
    </svg>
  );
};

export const StrategyIconButton = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1.5em'
      height='1.5em'
      viewBox='0 0 24 24'
    >
      <path
        fill='currentColor'
        d='M21.33 12.91c.09 1.55-.62 3.04-1.89 3.95l.77 1.49c.23.45.26.98.06 1.45c-.19.47-.58.84-1.06 1l-.79.25a1.69 1.69 0 0 1-1.86-.55L14.44 18c-.89-.15-1.73-.53-2.44-1.1c-.5.15-1 .23-1.5.23c-.88 0-1.76-.27-2.5-.79c-.53.16-1.07.23-1.62.22c-.79.01-1.57-.15-2.3-.45a4.1 4.1 0 0 1-2.43-3.61c-.08-.72.04-1.45.35-2.11c-.29-.75-.32-1.57-.07-2.33C2.3 7.11 3 6.32 3.87 5.82c.58-1.69 2.21-2.82 4-2.7c1.6-1.5 4.05-1.66 5.83-.37c.42-.11.86-.17 1.3-.17c1.36-.03 2.65.57 3.5 1.64c2.04.53 3.5 2.35 3.58 4.47c.05 1.11-.25 2.2-.86 3.13c.07.36.11.72.11 1.09m-5-1.41c.57.07 1.02.5 1.02 1.07a1 1 0 0 1-1 1h-.63c-.32.9-.88 1.69-1.62 2.29c.25.09.51.14.77.21c5.13-.07 4.53-3.2 4.53-3.25a2.59 2.59 0 0 0-2.69-2.49a1 1 0 0 1-1-1a1 1 0 0 1 1-1c1.23.03 2.41.49 3.33 1.3c.05-.29.08-.59.08-.89c-.06-1.24-.62-2.32-2.87-2.53c-1.25-2.96-4.4-1.32-4.4-.4c-.03.23.21.72.25.75a1 1 0 0 1 1 1c0 .55-.45 1-1 1c-.53-.02-1.03-.22-1.43-.56c-.48.31-1.03.5-1.6.56c-.57.05-1.04-.35-1.07-.9a.97.97 0 0 1 .88-1.1c.16-.02.94-.14.94-.77c0-.66.25-1.29.68-1.79c-.92-.25-1.91.08-2.91 1.29C6.75 5 6 5.25 5.45 7.2C4.5 7.67 4 8 3.78 9c1.08-.22 2.19-.13 3.22.25c.5.19.78.75.59 1.29c-.19.52-.77.78-1.29.59c-.73-.32-1.55-.34-2.3-.06c-.32.27-.32.83-.32 1.27c0 .74.37 1.43 1 1.83c.53.27 1.12.41 1.71.4q-.225-.39-.39-.81a1.038 1.038 0 0 1 1.96-.68c.4 1.14 1.42 1.92 2.62 2.05c1.37-.07 2.59-.88 3.19-2.13c.23-1.38 1.34-1.5 2.56-1.5m2 7.47l-.62-1.3l-.71.16l1 1.25zm-4.65-8.61a1 1 0 0 0-.91-1.03c-.71-.04-1.4.2-1.93.67c-.57.58-.87 1.38-.84 2.19a1 1 0 0 0 1 1c.57 0 1-.45 1-1c0-.27.07-.54.23-.76c.12-.1.27-.15.43-.15c.55.03 1.02-.38 1.02-.92'
      ></path>
    </svg>
  );
};

export const ProfitLossIconButton = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1.5em'
      height='1.5em'
      viewBox='0 0 24 24'
    >
      <path
        fill='currentColor'
        d='M3 7h3V4h2v3h3v2H8v3H6V9H3zm10 8h8v2h-8zm3.04-12h2.31L7.96 21H5.65z'
      ></path>
    </svg>
  );
};

export const CashFlowIconButton = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1.5em'
      height='1.5em'
      viewBox='0 0 24 24'
    >
      <path
        fill='currentColor'
        d='M6.5 10h-2v7h2zm6 0h-2v7h2zm8.5 9H2v2h19zm-2.5-9h-2v7h2zm-7-6.74L16.71 6H6.29zm0-2.26L2 6v2h19V6z'
      ></path>
    </svg>
  );
};

export const AnalysisIconButton = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1.5em'
      height='1.5em'
      viewBox='0 0 24 24'
    >
      <path
        fill='currentColor'
        d='M15.86 4.39v15c0 1.67 1.14 2.61 2.39 2.61c1.14 0 2.39-.79 2.39-2.61V4.5c0-1.54-1.14-2.5-2.39-2.5s-2.39 1.06-2.39 2.39M9.61 12v7.39C9.61 21.07 10.77 22 12 22c1.14 0 2.39-.79 2.39-2.61v-7.28c0-1.54-1.14-2.5-2.39-2.5S9.61 10.67 9.61 12m-3.86 5.23c1.32 0 2.39 1.07 2.39 2.38a2.39 2.39 0 1 1-4.78 0c0-1.31 1.07-2.38 2.39-2.38'
      ></path>
    </svg>
  );
};

export const MethodIconButton = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1.5em'
      height='1.5em'
      viewBox='0 0 24 24'
    >
      <path
        fill='currentColor'
        d='m21.71 20.29l-1.42 1.42a1 1 0 0 1-1.41 0L7 9.85A3.8 3.8 0 0 1 6 10a4 4 0 0 1-3.78-5.3l2.54 2.54l.53-.53l1.42-1.42l.53-.53L4.7 2.22A4 4 0 0 1 10 6a3.8 3.8 0 0 1-.15 1l11.86 11.88a1 1 0 0 1 0 1.41M2.29 18.88a1 1 0 0 0 0 1.41l1.42 1.42a1 1 0 0 0 1.41 0l5.47-5.46l-2.83-2.83M20 2l-4 2v2l-2.17 2.17l2 2L18 8h2l2-4Z'
      ></path>
    </svg>
  );
};

interface DeleteButtonProps {
  label: string;
  onClick: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  label,
  onClick,
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='w-[120px] rounded-lg py-2 text-attentionButtonText bg-attentionButtonBG hover:bg-attentionButtonBGTrans active:bg-attentionButtonBGActive active:transform active:scale-99 transition-all duration-200'
    >
      {label}
    </button>
  );
};

export const CalcIconButton = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='icon icon-tabler icons-tabler-outline icon-tabler-calculator'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M4 3m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z' />
      <path d='M8 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z' />
      <path d='M8 14l0 .01' />
      <path d='M12 14l0 .01' />
      <path d='M16 14l0 .01' />
      <path d='M8 17l0 .01' />
      <path d='M12 17l0 .01' />
      <path d='M16 17l0 .01' />
    </svg>
  );
};
