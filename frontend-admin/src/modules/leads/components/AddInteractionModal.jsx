import React, { useState } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

const TYPES = [
  { value: 'CALL', label: 'Phone Call' },
  { value: 'MEETING', label: 'Client Meeting' },
  { value: 'EMAIL', label: 'Email Correspondence' },
  { value: 'WHATSAPP', label: 'WhatsApp Message' },
  { value: 'NOTE', label: 'Internal Note' },
];

export default function AddInteractionModal({ isOpen, onClose, lead, onSuccess }) {
  const [formData, setFormData] = useState({
    interaction_type: 'CALL',
    notes: '',
    duration_minutes: '15',
    contact_person: lead?.contact_name || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.notes.trim()) {
      toast.error('Discussion notes are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await leadsApi.addInteraction({
        lead_id: lead.id,
        ...formData,
        duration_minutes: Number(formData.duration_minutes) || 0,
      });

      toast.success('Interaction logged successfully');
      onSuccess && onSuccess();
      onClose();
      setFormData({
        interaction_type: 'CALL',
        notes: '',
        duration_minutes: '15',
        contact_person: lead?.contact_name || '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to log interaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Customer Interaction"
      subtitle={`Record telecalling activity or meeting notes for ${lead?.company_name || 'Lead'}`}
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
            {isSubmitting ? 'Logging...' : 'Save Interaction'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="fluent-label">Activity Type *</label>
            <select
              value={formData.interaction_type}
              onChange={(e) => setFormData({ ...formData, interaction_type: e.target.value })}
              className="fluent-select"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="fluent-label">Duration (Minutes)</label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              className="fluent-input"
            />
          </div>
        </div>

        <div>
          <label className="fluent-label">Contact Person</label>
          <input
            type="text"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            placeholder="e.g. Rajesh Kumar (CTO)"
            className="fluent-input"
          />
        </div>

        <div>
          <label className="fluent-label">Discussion Notes & Action Items *</label>
          <textarea
            required
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Detailed notes on discussion, client pain points, next steps..."
            className="fluent-textarea"
          />
        </div>
      </form>
    </Modal>
  );
}
