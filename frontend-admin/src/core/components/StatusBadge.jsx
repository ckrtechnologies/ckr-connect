import React from 'react';

const STATUS_MAP = {
  // Lead Statuses
  NEW: { label: 'New', class: 'new' },
  CONTACTED: { label: 'Contacted', class: 'contacted' },
  FOLLOW_UP: { label: 'Follow Up', class: 'follow_up' },
  NEGOTIATION: { label: 'Negotiation', class: 'negotiation' },
  WON: { label: 'Won', class: 'won' },
  LOST: { label: 'Lost', class: 'lost' },
  INVALID: { label: 'Invalid', class: 'invalid' },

  // Attendance Statuses
  PRESENT: { label: 'Present', class: 'won' },
  ABSENT: { label: 'Absent', class: 'lost' },
  HALF_DAY: { label: 'Half Day', class: 'negotiation' },
  LEAVE: { label: 'On Leave', class: 'info' },
  HOLIDAY: { label: 'Holiday', class: 'neutral' },

  // Staff Roles
  SUPER_ADMIN: { label: 'Super Admin', class: 'info' },
  ADMIN: { label: 'Admin', class: 'contacted' },
  BDM: { label: 'BDM', class: 'neutral' },
  ACTIVE: { label: 'Active', class: 'won' },
  INACTIVE: { label: 'Inactive', class: 'lost' },
};

export default function StatusBadge({ status, customLabel, size = 'normal' }) {
  if (!status) return null;
  const upper = String(status).toUpperCase();
  const config = STATUS_MAP[upper] || { label: status, class: 'neutral' };

  return (
    <span className={`fluent-badge ${config.class}`} style={{ fontSize: size === 'small' ? '10px' : '11px' }}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {customLabel || config.label}
    </span>
  );
}
