import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const STAGES = [
  { id: 'NEW', label: '1. New Lead' },
  { id: 'CONTACTED', label: '2. Contacted' },
  { id: 'FOLLOW_UP', label: '3. Follow Up' },
  { id: 'NEGOTIATION', label: '4. Negotiation' },
  { id: 'WON', label: '5. Closed Won' },
];

export default function ProcessFlowBar({ currentStatus, onStageClick, disabled = false }) {
  const isLost = currentStatus === 'LOST';
  const isInvalid = currentStatus === 'INVALID';

  const currentIndex = STAGES.findIndex((s) => s.id === currentStatus);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
        {STAGES.map((stage, idx) => {
          const isCompleted = currentIndex > idx && !isLost && !isInvalid;
          const isActive = stage.id === currentStatus;
          const isPastOrCurrent = currentIndex >= idx;

          let bg = 'var(--color-surface-alt)';
          let color = 'var(--color-text-secondary)';
          let border = '1px solid var(--color-border)';

          if (isActive) {
            bg = 'var(--color-primary-light)';
            color = 'var(--color-primary)';
            border = '1px solid var(--color-primary)';
          } else if (isCompleted) {
            bg = 'var(--color-success-bg)';
            color = 'var(--color-success)';
            border = '1px solid rgba(16, 124, 16, 0.3)';
          }

          return (
            <button
              key={stage.id}
              onClick={() => onStageClick && onStageClick(stage.id)}
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '8px 12px',
                backgroundColor: bg,
                color: color,
                border: border,
                borderRadius: 'var(--radius-xs)',
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 150ms ease',
                outline: 'none',
              }}
            >
              {isCompleted ? (
                <Check size={14} color="var(--color-success)" strokeWidth={3} />
              ) : (
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-border-strong)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {idx + 1}
                </span>
              )}
              <span>{stage.label.split('. ')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Terminal Lost or Invalid status pill if applicable */}
      {(isLost || isInvalid) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: isLost ? 'var(--color-error-bg)' : 'var(--color-surface-alt)',
            color: isLost ? 'var(--color-error)' : 'var(--color-text-secondary)',
            border: `1px solid ${isLost ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-xs)',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={14} />
          <span>{isLost ? 'Terminal: Lost' : 'Terminal: Invalid'}</span>
        </div>
      )}
    </div>
  );
}
