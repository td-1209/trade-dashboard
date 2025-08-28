'use client';
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-50 bg-fullScreenModalBG'
      onClick={onClose}
    >
      <div
        className='bg-windowedScreenModalBG rounded-lg p-6 max-w-md w-full mx-4 shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-xl font-semibold mb-4 text-modalText'>{title}</h2>
        <p className='text-modalText mb-6'>{message}</p>
        <div className='flex justify-end space-x-3'>
          <button
            onClick={onConfirm}
            className='w-[120px] rounded-lg py-2 text-attentionButtonText bg-attentionButtonBG hover:bg-attentionButtonBGTrans active:bg-attentionButtonBGActive active:transform active:scale-99 transition-all duration-200'
          >
            削除
          </button>
          <button
            onClick={onClose}
            className='w-[120px] rounded-lg py-2 text-cancelButtonText bg-cancelButtonBG hover:bg-cancelButtonBGTrans active:bg-cancelButtonBGActive active:transform active:scale-99 transition-all duration-200'
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
