import React, { useState } from 'react';
import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';
import DateTimePicker from '../../../core/components/DateTimePicker.jsx';

export default function LogInteractionModal({ isOpen, leadId, leadName, onClose, onSuccess }) {
  const { bdms } = useBootstrap();
  const [type, setType] = useState('call');
  const [outcome, setOutcome] = useState('connected');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [bdmId, setBdmId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!notes.trim()) {
      toast.error('Please enter discussion notes');
      return;
    }

    try {
      setIsSubmitting(true);
      await leadsApi.logInteraction({
        lead_id: leadId,
        type,
        channel: type,
        outcome,
        call_result: outcome,
        notes: notes.trim(),
        next_action: nextAction.trim() || undefined,
        next_followup_date: nextFollowupDate ? new Date(nextFollowupDate).toISOString() : undefined,
        bdm_id: bdmId || undefined,
      });

      toast.success('Activity logged successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to log interaction');
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
        style={{ width: '520px', maxWidth: '92vw', padding: '20px' }}
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
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              + Log Interaction / Activity
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
          {/* Activity Type Buttons */}
          <div className="form-field-group">
            <label className="form-field-label">Interaction Channel *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { key: 'call', label: '📞 Call' },
                { key: 'whatsapp', label: '💬 WhatsApp' },
                { key: 'meeting', label: '👥 Meeting' },
                { key: 'site_visit', label: '🏢 Site Visit' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setType(c.key)}
                  style={{
                    padding: '8px',
                    border: '1px solid',
                    borderColor: type === c.key ? 'var(--color-primary)' : 'var(--color-border)',
                    background: type === c.key ? 'var(--color-primary-light, #E8F4FC)' : 'var(--color-surface)',
                    color: type === c.key ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: type === c.key ? 600 : 500,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'center',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Outcome */}
            <div className="form-field-group">
              <label className="form-field-label">Outcome / Result *</label>
              <select
                className="form-field-select"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                <option value="connected">Connected / Discussion</option>
                <option value="interested">Interested & Warm</option>
                <option value="proposal_requested">Proposal Requested</option>
                <option value="demo_scheduled">Demo Scheduled</option>
                <option value="left_voicemail">Left Voicemail / Unanswered</option>
                <option value="follow_up_required">Follow-up Required</option>
                <option value="not_interested">Not Interested</option>
              </select>
            </div>

            {/* BDM logged on behalf */}
            <div className="form-field-group">
              <label className="form-field-label">Executive / Caller</label>
              <select
                className="form-field-select"
                value={bdmId}
                onChange={(e) => setBdmId(e.target.value)}
              >
                <option value="">Logged as Current Admin</option>
                {bdms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Discussion Notes */}
          <div className="form-field-group">
            <label className="form-field-label">Discussion Notes & Summary *</label>
            <textarea
              className="form-field-textarea"
              placeholder="Detail key points discussed, client questions, pricing talks..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            {/* Next Action */}
            <div className="form-field-group">
              <label className="form-field-label">Next Action</label>
              <input
                type="text"
                className="form-field-input"
                placeholder="e.g. Send updated pricing proposal"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
              />
            </div>

            {/* Next Follow-up Date */}
            <div className="form-field-group">
              <label className="form-field-label">Next Follow-up (Date & Time)</label>
              <DateTimePicker
                value={nextFollowupDate}
                onChange={setNextFollowupDate}
              />
            </div>
          </div>

          {/* Footer actions */}
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
              className="fluent-btn fluent-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
