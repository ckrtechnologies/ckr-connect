import React, { useState } from 'react';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function MarkLostModal({ isOpen, leadId, leadName, onClose, onSuccess }) {
  const [dropoffType, setDropoffType] = useState('lost'); // 'lost' or 'invalid'
  const [lostReason, setLostReason] = useState('Price / Budget constraint');
  const [invalidReason, setInvalidReason] = useState('Wrong number / Unreachable');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setIsSubmitting(true);
      if (dropoffType === 'lost') {
        await leadsApi.updateLeadStatus(leadId, {
          status: 'lost',
          lost_reason: lostReason,
          remarks: remarks || `Marked as Lost: ${lostReason}`,
        });
        toast.success('Lead marked as Lost');
      } else {
        await leadsApi.updateLeadStatus(leadId, {
          status: 'invalid',
          invalid_reason: invalidReason,
          remarks: remarks || `Marked as Invalid: ${invalidReason}`,
        });
        toast.success('Lead marked as Invalid');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update lead status');
    } finally {
      setIsSubmitting(false);
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
        style={{ width: '480px', maxWidth: '92vw', padding: '20px' }}
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
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--color-error)' }}>
              Branch Drop-off: Mark Lost / Invalid
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Lead: <strong>{leadName || 'Selected Lead'}</strong>
            </div>
          </div>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Classification Selection */}
          <div className="form-field-group">
            <label className="form-field-label">Drop-off Classification *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDropoffType('lost')}
                style={{
                  padding: '10px',
                  border: '1px solid',
                  borderColor: dropoffType === 'lost' ? 'var(--color-error)' : 'var(--color-border)',
                  background: dropoffType === 'lost' ? 'var(--color-error-bg)' : 'var(--color-surface)',
                  color: dropoffType === 'lost' ? 'var(--color-error)' : 'var(--color-text-primary)',
                  fontWeight: dropoffType === 'lost' ? 600 : 500,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                🔴 Mark as Lost Deal
              </button>
              <button
                type="button"
                onClick={() => setDropoffType('invalid')}
                style={{
                  padding: '10px',
                  border: '1px solid',
                  borderColor: dropoffType === 'invalid' ? 'var(--color-warning)' : 'var(--color-border)',
                  background: dropoffType === 'invalid' ? 'var(--color-warning-bg)' : 'var(--color-surface)',
                  color: dropoffType === 'invalid' ? 'var(--color-warning)' : 'var(--color-text-primary)',
                  fontWeight: dropoffType === 'invalid' ? 600 : 500,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                ⚠️ Mark as Invalid Data
              </button>
            </div>
          </div>

          {dropoffType === 'lost' ? (
            <div className="form-field-group">
              <label className="form-field-label">Primary Reason for Lost Deal *</label>
              <select
                className="form-field-select"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              >
                <option value="Price / Budget constraint">Price / Budget constraint</option>
                <option value="Competitor chosen">Competitor chosen</option>
                <option value="Feature / Scope mismatch">Feature / Scope mismatch</option>
                <option value="Project postponed / Cancelled">Project postponed / Cancelled</option>
                <option value="Decision maker unreachable / Left">Decision maker unreachable / Left</option>
                <option value="Other">Other</option>
              </select>
            </div>
          ) : (
            <div className="form-field-group">
              <label className="form-field-label">Reason for Invalid Data *</label>
              <select
                className="form-field-select"
                value={invalidReason}
                onChange={(e) => setInvalidReason(e.target.value)}
              >
                <option value="Wrong number / Unreachable">Wrong number / Unreachable</option>
                <option value="Fake or Test inquiry">Fake or Test inquiry</option>
                <option value="Student / Job seeker">Student / Job seeker</option>
                <option value="Out of operational territory">Out of operational territory</option>
                <option value="Duplicate record">Duplicate record</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className="form-field-group">
            <label className="form-field-label">Additional Remarks & Context</label>
            <textarea
              className="form-field-textarea"
              rows={3}
              placeholder="Provide context on why this deal dropped off..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '14px',
              marginTop: '4px',
            }}
          >
            <button
              type="button"
              className="fluent-btn fluent-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fluent-btn"
              style={{
                background: 'var(--color-error)',
                color: '#FFFFFF',
                fontWeight: 600,
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Confirm Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
