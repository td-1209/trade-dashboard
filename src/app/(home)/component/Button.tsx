import React from 'react';

interface SingleButtonType {
  label: string;
  action: () => void;
}

export const SingleButton: React.FC<SingleButtonType> = ({ label, action }) => {
  return (
    <button
      onClick={action}
      className='w-[120px] rounded-lg py-2 mx-0 text-normalButtonText bg-normalButtonBG hover:bg-normalButtonBGTrans active:bg-normalButtonBGActive active:transform active:scale-99 transition-all duration-200'
    >
      {label}
    </button>
  );
};

interface TwinButtonsType {
  leftLabel: string,
  rightLabel: string,
  leftAction: () => void,
  rightAction: () => void
}

export const TwinButtons: React.FC<TwinButtonsType> = ({ leftLabel, rightLabel, leftAction, rightAction }) => {
  return (
    <div className='flex justify-between w-full pt-5 pb-10 px-5'>
      <button
        onClick={leftAction}
        className='w-[120px] rounded-lg py-2 m-4 text-cancelButtonText bg-cancelButtonBG hover:bg-cancelButtonBGTrans active:bg-cancelButtonBGActive active:transform active:scale-99 transition-all duration-200'
      >
        {leftLabel}
      </button>
      <button
        onClick={rightAction}
        className='w-[120px] rounded-lg py-2 m-4 text-secondaryButtonText bg-secondaryButtonBG hover:bg-secondaryButtonBGTrans active:bg-secondaryButtonBGActive active:transform active:scale-99 transition-all duration-200'
      >
        {rightLabel}
      </button>
    </div>
  );
};

interface FormTwinButtonsType {
  leftLabel: string,
  rightLabel: string,
  leftAction: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const FormTwinButtons: React.FC<FormTwinButtonsType> = ({ leftLabel, rightLabel, leftAction }) => {
  return (
    <div className='flex justify-between w-full pt-5 pb-10 px-5'>
      <button
        onClick={leftAction}
        className='w-[120px] rounded-lg py-2 m-4 text-cancelButtonText bg-cancelButtonBG hover:bg-cancelButtonBGTrans active:bg-cancelButtonBGActive active:transform active:scale-99 transition-all duration-200'
      >
        {leftLabel}
      </button>
      <button
        type='submit'
        className='w-[120px] rounded-lg py-2 m-4 text-secondaryButtonText bg-secondaryButtonBG hover:bg-secondaryButtonBGTrans active:bg-secondaryButtonBGActive active:transform active:scale-99 transition-all duration-200'
      >
        {rightLabel}
      </button>
    </div>
  );
};

interface DummyButtonProps {
  label: string;
}

export const DummyButton: React.FC<DummyButtonProps> = ({ label }) => {
  return (
    <button
      className='w-[120px] rounded-lg py-2 mx-0 text-normalButtonText bg-normalButtonBG hover:bg-normalButtonBGTrans active:bg-normalButtonBGActive active:transform active:scale-99 transition-all duration-200'
    >
      {label}
    </button>
  );
};

// interface IconButtonType {
//   action: () => void;
// }

// const IconButton: React.FC<IconButtonType & { children: React.ReactNode }> = ({ action, children }) => {
//   return (
//     <button
//       onClick={action}
//       className='p-2 text-icon hover:bg-transparent active:bg-transparent focus:outline-none'
//       aria-label='Icon button'
//     >
//       {children}
//     </button>
//   );
// };

// export const SearchIconButton: React.FC<IconButtonType> = ({ action }) => {
//   return (
//     <IconButton action={action}>
//       <MagnifyingGlassIcon className='size-6' />
//     </IconButton>
//   );
// };