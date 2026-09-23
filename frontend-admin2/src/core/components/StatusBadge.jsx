import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const normalized = String(status).toLowerCase();
  const label = normalized.replace('_', ' ');

  return (
    <span className={`status-badge ${normalized}`}>
      {label}
    </span>
  );
}
