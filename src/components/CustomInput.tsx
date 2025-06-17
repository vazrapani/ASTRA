import React from 'react';
import styles from './CustomInput.module.css';

type CustomInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
};

const CustomInput: React.FC<CustomInputProps> = ({ value, onChange, placeholder, type = 'text', className }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={className ? styles.input + ' ' + className : styles.input}
  />
);

export default CustomInput; 