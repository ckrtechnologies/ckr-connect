import React from 'react';

export default function CommandBar({
  title,
  subtitle,
  actions = [],
  children,
}) {
  return (
    <div
      style={{
        height: 'var(--command-bar-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Title & Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <>
            <span style={{ color: 'var(--color-border-strong)' }}>|</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            disabled={act.disabled}
            className={`fluent-btn ${act.primary ? 'fluent-btn-primary' : 'fluent-btn-secondary'}`}
            title={act.title || act.label}
          >
            {act.icon && <span style={{ display: 'flex' }}>{act.icon}</span>}
            <span>{act.label}</span>
          </button>
        ))}
        {children}
      </div>
    </div>
  );
}
