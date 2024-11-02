import { useState } from 'react';
import { Item } from '@/types/type';

type UpdatedFields<T> = {[K in keyof T]: boolean};
type FormDataHookReturn<T extends Record<string, Item>> = [
  T,
  UpdatedFields<T>,
  {
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    setUpdatedFields: React.Dispatch<React.SetStateAction<UpdatedFields<T>>>;
    handleChangeStringForm: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeNumberForm: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeSelectForm: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleChangeRadioForm: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetFormData: () => void;
  }
];

export function useFormData<T extends Record<string, Item>>(initialData: T): FormDataHookReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [updatedFields, setUpdatedFields] = useState<UpdatedFields<T>>(
    Object.keys(initialData).reduce((acc, key) => ({...acc, [key]: false}), {} as UpdatedFields<T>)
  );

  const handleChangeStringForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    setUpdatedFields(prev => ({...prev, [name]: true}));
  };

  const handleChangeNumberForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    setUpdatedFields(prev => ({...prev, [name]: true}));
  };
  
  const handleChangeSelectForm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    setUpdatedFields(prev => ({...prev, [e.target.name]: true}));
  };
  
  const handleChangeRadioForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === 'true';
    setFormData(prev => ({...prev, [e.target.name]: value}));
    setUpdatedFields(prev => ({...prev, [e.target.name]: true}));
  };
  
  const resetFormData = () => {
    setUpdatedFields(
      Object.keys(initialData).reduce((acc, key) => ({...acc, [key]: false}), {} as UpdatedFields<T>)
    );
  };
  
  return [ formData, updatedFields, { setFormData, setUpdatedFields, handleChangeStringForm, handleChangeNumberForm, handleChangeSelectForm, handleChangeRadioForm, resetFormData }];
}