import React from 'react';

type CustomButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
};

const CustomButton: React.FC<CustomButtonProps> = ({ children, onClick, style, type = 'button' }) => (
  <button type={type} onClick={onClick} style={{ padding: '0.75em 1.5em', borderRadius: '8px', background: '#6c47ff', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1em', cursor: 'pointer', ...style }}>
    {children}
  </button>
);

export default CustomButton; 