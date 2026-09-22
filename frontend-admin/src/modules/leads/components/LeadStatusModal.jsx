import React, { useState } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'FOLLOW_UP', label: 'Follow Up' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Closed Won' },
  { value: 'LOST', label: 'Closed Lost' },
  { value: 'INVALID', label: 'Invalid' },
];

export default function LeadStatusModal({
  isOpen,
  onClose,
  lead,
  targetStatus,
  onSuccess,
}) {
  const [status, setStatus] = useState(targetStatus || lead?.status || 'NEW');
  const [wonAmount, setWonAmount] = useState(lead?.won_amount || lead?.expected_value || '');
  const [lostReason, setLostReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (targetStatus) setStatus(targetStatus);
  }, [targetStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead?.id) return;

    if (status === 'WON' && (!wonAmount || Number(wonAmount) <= 0)) {
      toast.error('Won amount is required when closing as Won');
      return;
    }

    if (status === 'LOST' && !lostReason.trim()) {
      toast.error('Please specify the reason for losing this opportunity');
      return;
    }

    try {
      setIsSubmitting(true);
      await leadsApi.updateStatus(lead.id, {
        status,
        won_amount: status === 'WON' ? Number(wonAmount) : undefined,
        lost_reason: status === 'LOST' ? lostReason.trim() : undefined,
      });

      toast.success(`Lead marked as ${status}`);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Opportunity Stage"
      subtitle={`Transition stage for ${lead?.company_name || 'Lead'}`}
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
            {isSubmitting ? 'Updating...' : 'Confirm Stage Change'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="fluent-label">Select Stage *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="fluent-select"
            required
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {status === 'WON' && (
          <div>
            <label className="fluent-label">Actual Won Contract Amount (₹) *</label>
            <input
              type="number"
              required
              value={wonAmount}
              onChange={(e) => setWonAmount(e.target.value)}
              placeholder="e.g. 500000"
              className="fluent-input"
            />
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
              This final amount will be recorded for revenue rollups and BDM quota achievement.
            </span>
          </div>
        )}

        {status === 'LOST' && (
          <div>
            <label className="fluent-label">Lost Reason *</label>
            <textarea
              required
              rows={3}
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="e.g. Chose competitor, budget constraints, internal restructuring..."
              className="fluent-textarea"
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
