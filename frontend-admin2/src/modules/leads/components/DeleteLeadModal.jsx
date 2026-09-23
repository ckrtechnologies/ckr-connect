import React, { useState } from 'react';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function DeleteLeadModal({ isOpen, leadIds = [], leadNames = '', onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || leadIds.length === 0) return null;

  const count = leadIds.length;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (count === 1) {
        await leadsApi.deleteLead(leadIds[0]);
      } else {
        // Bulk delete in one request
        await leadsApi.bulkDelete(leadIds);
      }
      toast.success(count === 1 ? 'Lead deleted successfully' : `${count} leads deleted successfully`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete lead(s)');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fluent-dialog-backdrop open"
      onClick={onClose}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
    >
      <div
        className="fluent-dialog-box"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '460px', maxWidth: '92vw', padding: '20px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--color-error)' }}>
            ⚠️ Confirm Delete {count === 1 ? 'Lead' : `${count} Leads`}
          </h2>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div style={{ fontSize: '13px', lineHeight: '20px', color: 'var(--color-text-primary)' }}>
          {count === 1 ? (
            <p>
              Are you sure you want to permanently delete lead <strong>{leadNames || 'this lead'}</strong>?
              All associated timeline interactions, reminders, and historical details will also be removed.
            </p>
          ) : (
            <p>
              Are you sure you want to permanently delete <strong>{count} selected leads</strong>?
              This bulk deletion cannot be undone.
            </p>
          )}
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
              background: 'var(--color-error)',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : count === 1 ? 'Delete Lead' : `Delete ${count} Leads`}
          </button>
        </div>
      </div>
    </div>
  );
}
