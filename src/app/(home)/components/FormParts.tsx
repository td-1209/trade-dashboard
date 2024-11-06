import React, { ChangeEvent } from 'react';

interface TextFormProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  errorMessage?: string;
}

export const TextForm: React.FC<TextFormProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  errorMessage
}) => {
  return (
    <div className='py-1'>
      <label className='block text-sm text-lightGray'>
        {label}
      </label>
      <input
        type='text'
        name={name}
        value={value}
        onChange={onChange}
        className='block w-full px-2 py-2 rounded-md bg-darkGray placeholder:text-lightGray focus:outline-none focus:bg-black text-white'
        placeholder={placeholder}
      />
      <div>
        {errorMessage? (
          <p className='text-sm text-negative'>{errorMessage}</p>
        ) : (
          <p className='text-sm text-transparent'>&#8203;</p>
        )}
      </div>
    </div>
  );
};

export const TextAreaForm: React.FC<TextFormProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  errorMessage
}) => {
  return (
    <div className='py-1'>
      <label className='block text-sm text-lightGray'>
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className='block w-full px-2 py-2 rounded-md bg-darkGray placeholder:text-lightGray focus:outline-none focus:bg-black text-white resize-y min-h-[100px]'
        placeholder={placeholder}
      />
      <div>
        {errorMessage? (
          <p className='text-sm text-negative'>{errorMessage}</p>
        ) : (
          <p className='text-sm text-transparent'>&#8203;</p>
        )}
      </div>
    </div>
  );
};

interface NumberFormProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  errorMessage?: string;
}

export const NumberForm: React.FC<NumberFormProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  errorMessage
}) => {
  return (
    <div className='py-1'>
      <label className='block text-sm text-lightGray'>
        {label}
      </label>
      <input
        type='text'
        name={name}
        value={value}
        onChange={onChange}
        className='block w-full px-2 py-2 rounded-md bg-darkGray placeholder:text-lightGray focus:outline-none focus:bg-black text-white'
        placeholder={placeholder}
      />
      <div>
        {errorMessage? (
          <p className='text-sm text-negative'>{errorMessage}</p>
        ) : (
          <p className='text-sm text-transparent'>&#8203;</p>
        )}
      </div>
    </div>
  );
};

interface SelectFormProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  errorMessage?: string;
}

export const SelectForm: React.FC<SelectFormProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  errorMessage
}) => {
  return (
    <div className='py-1'>
      <label className='block text-sm text-lightGray'>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className='block w-full px-2 py-2 rounded-md bg-darkGray text-white focus:outline-none focus:bg-black'
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div>
        {errorMessage ? (
          <p className='text-sm text-negative'>{errorMessage}</p>
        ) : (
          <p className='text-sm text-transparent'>&#8203;</p>
        )}
      </div>
    </div>
  );
};

interface RadioFormProps {
  label: string;
  name: string;
  value: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  options: { value: boolean; label: string }[];
  errorMessage?: string;
}

export const RadioForm: React.FC<RadioFormProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  errorMessage
}) => {
  return (
    <div className='py-1'>
      <label className='block text-sm text-lightGray mb-2'>
        {label}
      </label>
      <div className='space-x-5 flex'>
        {options.map((option) => (
          <div key={option.label}>
            <input
              type='radio'
              id={`${name}-${option.value}`}
              name={name}
              value={option.value.toString()}
              checked={value === option.value}
              onChange={onChange}
              className='mr-2 text-secondary checked:border-none'
            />
            <label htmlFor={`${name}-${option.value}`} className='text-white'>
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <div>
        {errorMessage ? (
          <p className='text-sm text-negative mt-1'>{errorMessage}</p>
        ) : (
          <p className='text-sm text-transparent mt-1'>&#8203;</p>
        )}
      </div>
    </div>
  );
};