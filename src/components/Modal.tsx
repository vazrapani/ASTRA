import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const contentStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  minWidth: 320,
  maxWidth: 400,
  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
  padding: 0,
  position: 'relative',
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 12,
  fontSize: 22,
  color: '#888',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose} aria-label="닫기">×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 