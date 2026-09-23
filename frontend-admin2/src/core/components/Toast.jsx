import React, { useState, useEffect } from 'react';

let toastFn = null;

export const toast = {
  success: (msg) => toastFn && toastFn({ message: msg, type: 'success' }),
  error: (msg) => toastFn && toastFn({ message: msg, type: 'error' }),
  info: (msg) => toastFn && toastFn({ message: msg, type: 'info' }),
};

export function ToastContainer() {
  const [toastState, setToastState] = useState(null);

  useEffect(() => {
    toastFn = (t) => {
      setToastState(t);
      setTimeout(() => {
        setToastState(null);
      }, 3500);
    };
    return () => {
      toastFn = null;
    };
  }, []);

  if (!toastState) return null;

  const borderColor =
    toastState.type === 'error'
      ? 'var(--color-error)'
      : toastState.type === 'success'
      ? 'var(--color-success)'
      : 'var(--color-primary)';

  return (
    <div
      id="proto-toast"
      className="show"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: '#201F1E',
        color: '#FFFFFF',
        padding: '10px 18px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: 'var(--shadow-level2)',
        borderLeft: `4px solid ${borderColor}`,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>
        {toastState.type === 'success' ? '✓' : toastState.type === 'error' ? '⚠' : 'ℹ'}
      </span>
      <span>{toastState.message}</span>
    </div>
  );
}

export default ToastContainer;
