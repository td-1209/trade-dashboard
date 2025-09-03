'use client';

import { uploadImage, deleteImage } from '@/lib/supabase/storage';
import Image from 'next/image';
import { useState } from 'react';

interface UploaderProps {
  onUpload: (url: string) => void;
  onDelete?: () => void;
  currentImage?: string;
  label?: string;
}

export default function Uploader({ onUpload, onDelete, currentImage }: UploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      console.log(`Original file size: ${originalSize}MB`);

      // 既存画像がある場合は先に削除
      if (currentImage) {
        try {
          await deleteImage(currentImage);
          console.log('Previous image deleted');
        } catch (deleteError) {
          console.warn('Failed to delete previous image:', deleteError);
          // 削除失敗してもアップロードは続行
        }
      }

      const url = await uploadImage(file);
      onUpload(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImage || !onDelete) return;

    try {
      setDeleting(true);
      await deleteImage(currentImage);
      onDelete();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('画像の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center space-x-2'>
        <input
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          disabled={uploading || deleting}
          className='block flex-1 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-primary disabled:opacity-50'
        />
        {currentImage && onDelete && (
          <button
            type='button'
            onClick={handleDelete}
            disabled={uploading || deleting}
            className='px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {deleting ? '削除中...' : '削除'}
          </button>
        )}
      </div>

      {currentImage && (
        <div className='mt-2'>
          <Image
            src={currentImage}
            alt='Uploaded'
            width={100}
            height={100}
            className='max-w-xs h-auto rounded-lg border border-darkGray shadow-sm'
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}

      {(uploading || deleting) && (
        <div className='text-sm text-secondary'>
          {uploading && (
            <>
              <p>画像を圧縮中...</p>
              <p>アップロード中...</p>
            </>
          )}
          {deleting && <p>画像を削除中...</p>}
        </div>
      )}
    </div>
  );
}
