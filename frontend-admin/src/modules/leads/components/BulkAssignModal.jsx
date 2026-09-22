import React, { useState } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function BulkAssignModal({ isOpen, onClose, selectedLeadIds = [], onSuccess }) {
  const { bdms } = useBootstrap();
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedTo) {
      toast.error('Please select a BDM to assign');
      return;
    }

    try {
      setIsSubmitting(true);
      await leadsApi.bulkAssign({
        lead_ids: selectedLeadIds,
        assigned_to: assignedTo,
      });

      toast.success(`Successfully assigned ${selectedLeadIds.length} lead(s)`);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Bulk assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Assign Leads"
      subtitle={`Assign ${selectedLeadIds.length} selected record(s) to a dedicated sales rep`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="fluent-btn fluent-btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="fluent-btn fluent-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Records'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="fluent-label">Select Business Development Manager (BDM) *</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="fluent-select"
            required
          >
            <option value="">-- Choose Sales Rep --</option>
            {bdms.map((b) => (
              <option key={b.id} value={b.id}>
                {b.full_name} ({b.email})
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
