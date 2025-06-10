import React from 'react';

type CustomInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
};

const CustomInput: React.FC<CustomInputProps> = ({ value, onChange, placeholder, type = 'text', style }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{ padding: '0.5em 1em', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1em', ...style }}
  />
);

export default CustomInput; 