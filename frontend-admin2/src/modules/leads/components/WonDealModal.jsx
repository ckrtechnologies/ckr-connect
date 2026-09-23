import React, { useState } from 'react';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function WonDealModal({ isOpen, lead, onClose, onSuccess }) {
  if (!isOpen || !lead) return null;

  const [wonAmount, setWonAmount] = useState(lead.expected_value || lead.budget || 480000);
  const [dealType, setDealType] = useState(lead.deal_type || 'new_business');
  const [accountName, setAccountName] = useState(lead.company_name || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(wonAmount);
    if (!amountNum || amountNum <= 0) {
      toast.warning('Closed Won Amount is mandatory when closing deal as Won');
      return;
    }

    try {
      setIsSubmitting(true);
      await leadsApi.updateLeadStatus(lead.id, {
        status: 'won',
        won_amount: amountNum,
        remarks: notes.trim()
          ? `${notes.trim()} (Deal Type: ${dealType}, Closed: ₹${amountNum.toLocaleString('en-IN')})`
          : `Deal closed as Won with revenue ₹${amountNum.toLocaleString('en-IN')}`,
      });

      // Update lead metadata if dealType or companyName changed
      if (dealType !== lead.deal_type || (accountName && accountName !== lead.company_name)) {
        await leadsApi.updateLead(lead.id, {
          deal_type: dealType,
          company_name: accountName,
          won_amount: amountNum,
        });
      }

      toast.success(`🎉 Congratulations! Deal closed as Won for ₹${amountNum.toLocaleString('en-IN')}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record won deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="deal-modal-backdrop open" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="deal-modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '500px', maxWidth: '92vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Convert & Close Deal as Won</h2>
          </div>
          <button className="icon-btn-utility" onClick={onClose} title="Close">✕</button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '16px', margin: '8px 0 12px 0' }}>
          Record actual closed deal value and customer account linkage per <strong>PRD US-27 & US-29</strong>.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-field-group">
            <label className="form-field-label">Actual Closed Deal Amount (₹ Mandatory) *</label>
            <input
              type="number"
              className="form-field-input"
              required
              min="1"
              step="any"
              value={wonAmount}
              onChange={(e) => setWonAmount(e.target.value)}
              placeholder="e.g. 480000"
            />
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Deal Type</label>
            <select
              className="form-field-select"
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
            >
              <option value="new_business">New Business (First Sale)</option>
              <option value="upsell">Upsell (Additional Module/Campus)</option>
              <option value="resell">Resell / AMC Renewal</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Customer Company / Account</label>
            <input
              type="text"
              className="form-field-input"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Institution / School Name"
            />
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Links to Customer Account to accumulate lifetime revenue.
            </span>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Closing Notes & Payment Terms</label>
            <textarea
              className="form-field-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Signed 3-year ERP agreement with 50% advance received via NEFT"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
            <button type="button" className="fluent-btn fluent-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="fluent-btn fluent-btn-primary"
              style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)', fontWeight: 600 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording...' : 'Confirm & Record Won Revenue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
