import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

let toastSubscriber = null;

export const toast = {
  success: (msg) => toastSubscriber && toastSubscriber({ type: 'success', message: msg }),
  error: (msg) => toastSubscriber && toastSubscriber({ type: 'error', message: msg }),
  warning: (msg) => toastSubscriber && toastSubscriber({ type: 'warning', message: msg }),
  info: (msg) => toastSubscriber && toastSubscriber({ type: 'info', message: msg }),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastSubscriber = (toastItem) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...toastItem, id }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    return () => {
      toastSubscriber = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fluent-toast-container">
      {toasts.map((t) => {
        let Icon = Info;
        if (t.type === 'success') Icon = CheckCircle2;
        if (t.type === 'error') Icon = AlertCircle;
        if (t.type === 'warning') Icon = AlertTriangle;

        return (
          <div key={t.id} className={`fluent-toast ${t.type}`}>
            <Icon size={18} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.7,
                display: 'flex',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
