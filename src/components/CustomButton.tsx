import React from 'react';
import styles from './CustomButton.module.css';

type CustomButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const CustomButton: React.FC<CustomButtonProps> = ({ children, onClick, type = 'button', className }) => (
  <button
    type={type}
    onClick={onClick}
    className={className ? styles.button + ' ' + className : styles.button}
  >
    {children}
  </button>
);

export default CustomButton; 