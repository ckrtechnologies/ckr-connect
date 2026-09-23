import React, { useState } from 'react';
import staffApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function DeleteStaffModal({ isOpen, staff, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !staff) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await staffApi.deleteStaff(staff.id);
      toast.success(`Staff member "${staff.name}" removed successfully`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete staff member');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fluent-dialog-backdrop open"
      onClick={onClose}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="fluent-dialog-box"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px', maxWidth: '95vw', borderTop: '4px solid #d13438' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: '#d13438' }}>
            Delete Staff Member
          </h2>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-text-primary)' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            Are you sure you want to delete <strong>{staff.name}</strong> ({staff.employee_id || staff.email})?
          </p>

          <div
            style={{
              background: 'rgba(209, 52, 56, 0.08)',
              border: '1px solid rgba(209, 52, 56, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontSize: '12px',
              color: '#a80000',
              marginBottom: '16px',
            }}
          >
            ⚠️ <strong>Warning:</strong> Any active leads currently assigned to this BDM ({staff.active_leads_count ?? 0} leads) will be unassigned so that they can be redistributed to other staff members.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '14px',
            marginTop: '16px',
          }}
        >
          <button
            type="button"
            className="fluent-btn fluent-btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="fluent-btn"
            style={{
              background: '#d13438',
              color: '#ffffff',
              border: '1px solid #d13438',
            }}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
