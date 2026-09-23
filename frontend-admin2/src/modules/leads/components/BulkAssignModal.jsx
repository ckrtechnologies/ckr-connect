import React, { useState } from 'react';
import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function BulkAssignModal({ isOpen, selectedLeadIds = [], onClose, onSuccess }) {
  const { bdms } = useBootstrap();
  const [selectedBdm, setSelectedBdm] = useState(bdms[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selectedBdm) {
      toast.error('Please select a BDM');
      return;
    }

    try {
      setIsSubmitting(true);
      await leadsApi.bulkAssign(selectedLeadIds, selectedBdm);
      toast.success(`Assigned ${selectedLeadIds.length} lead(s) successfully`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to assign leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fluent-dialog-backdrop open" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="fluent-dialog-box" onClick={(e) => e.stopPropagation()} style={{ width: '480px', maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
            👤 Assign / Reassign Leads ({selectedLeadIds.length})
          </h2>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 0' }}>
          <label className="form-field-label" style={{ marginBottom: '8px', display: 'block' }}>
            Select Target BDM Executive:
          </label>
          <select
            className="form-field-select"
            value={selectedBdm}
            onChange={(e) => setSelectedBdm(e.target.value)}
            style={{ width: '100%', height: '36px' }}
          >
            {bdms.map((u) => (
              <option key={u.id} value={u.id}>
                👤 {u.name} ({u.employee_id || 'BDM'})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            All {selectedLeadIds.length} selected lead(s) will be routed to this executive's active pipeline and mobile app immediately.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
          <button type="button" className="fluent-btn fluent-btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="fluent-btn fluent-btn-primary" onClick={handleAssign} disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : `Assign ${selectedLeadIds.length} Leads`}
          </button>
        </div>
      </div>
    </div>
  );
}
