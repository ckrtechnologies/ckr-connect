import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function QuickCreateDrawer({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { tags, bdms } = useBootstrap();

  const defaultFollowUp = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    discussion_notes: '',
    company_name: '',
    tag_id: '',
    expected_value: '',
    next_followup_date: defaultFollowUp,
    city: '',
    state: 'Delhi',
    email: '',
    assigned_to: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tags && tags.length > 0 && !formData.tag_id) {
      setFormData((prev) => ({ ...prev, tag_id: tags[0].id }));
    }
    if (bdms && bdms.length > 0 && !formData.assigned_to) {
      setFormData((prev) => ({ ...prev, assigned_to: bdms[0].id }));
    }
  }, [tags, bdms]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (openDetail = false) => {
    if (!formData.name.trim()) {
      toast.error('Contact Person Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone Number is required');
      return;
    }
    if (!formData.discussion_notes.trim()) {
      toast.error('Discussion / Requirement Notes are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        notes: formData.discussion_notes.trim(),
        discussion_notes: formData.discussion_notes.trim(),
        sub_requirement: formData.discussion_notes.trim(),
        company_name: formData.company_name?.trim() || formData.name.trim(),
        tag_id: formData.tag_id || undefined,
        expected_value: formData.expected_value ? Number(formData.expected_value) : 0,
        assigned_to: formData.assigned_to || undefined,
        next_followup_date: formData.next_followup_date || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state || undefined,
        email: formData.email?.trim() || undefined,
        status: 'new',
      };

      const res = await leadsApi.createLead(payload);
      toast.success('Lead created successfully');

      // Reset form
      setFormData({
        name: '',
        phone: '',
        discussion_notes: '',
        company_name: '',
        tag_id: tags[0]?.id || '',
        expected_value: '',
        next_followup_date: defaultFollowUp,
        city: '',
        state: 'Delhi',
        email: '',
        assigned_to: bdms[0]?.id || '',
      });

      if (onSuccess) onSuccess();
      onClose();

      if (openDetail && res?.data?.id) {
        navigate(`/leads/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="quick-create-overlay dock-right open"
      id="quick-create-overlay"
      onClick={onClose}
    >
      <div className="quick-create-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quick-create-header">
          <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Quick Add Lead</span>
          </h2>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="quick-create-body">
          {/* Mandatory Information Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderLeft: '3px solid var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
            }}
          >
            <div
              className="quick-create-section-title"
              style={{
                marginTop: 0,
                paddingBottom: '6px',
                borderBottom: '1px dashed var(--color-border)',
              }}
            >
              <span>⭐</span>
              <span>REQUIRED INFORMATION (MANDATORY)</span>
            </div>

            <div className="form-fields-grid" style={{ marginTop: '10px' }}>
              <div className="form-field-group full-width">
                <label className="form-field-label">
                  Contact Person Name <span style={{ color: '#D83B01', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="form-field-group full-width">
                <label className="form-field-label">
                  Phone Number <span style={{ color: '#D83B01', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="tel"
                  className="form-field-input"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="form-field-group full-width">
                <label className="form-field-label">
                  Discussion / Requirement Notes <span style={{ color: '#D83B01', fontWeight: 700 }}>*</span>
                </label>
                <textarea
                  className="form-field-textarea"
                  id="discussion_notes"
                  value={formData.discussion_notes}
                  onChange={handleChange}
                  style={{ height: '80px' }}
                  placeholder="Enter initial discussion notes and client requirements..."
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Automatically logged into Daily Interaction Waterfall & Calling Ledger.
                </span>
              </div>
            </div>
          </div>

          {/* Optional Details Card */}
          <div
            style={{
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
            }}
          >
            <div
              className="quick-create-section-title"
              style={{
                marginTop: 0,
                paddingBottom: '6px',
                borderBottom: '1px dashed var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>⚙️</span>
              <span>ADDITIONAL LEAD ATTRIBUTES</span>
            </div>

            <div className="form-fields-grid" style={{ marginTop: '10px' }}>
              <div className="form-field-group full-width">
                <label className="form-field-label">Company / School / Organization</label>
                <input
                  type="text"
                  className="form-field-input"
                  id="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Organization or company name"
                />
              </div>

              <div className="form-field-group full-width">
                <label className="form-field-label">Offering / Solution Tag</label>
                <select
                  className="form-field-select"
                  id="tag_id"
                  value={formData.tag_id}
                  onChange={handleChange}
                >
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Expected Deal Value (₹)</label>
                <input
                  type="number"
                  className="form-field-input"
                  id="expected_value"
                  value={formData.expected_value}
                  onChange={handleChange}
                  placeholder="500000"
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Next Follow-up Due Date</label>
                <input
                  type="date"
                  className="form-field-input"
                  id="next_followup_date"
                  value={formData.next_followup_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">City</label>
                <input
                  type="text"
                  className="form-field-input"
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">State</label>
                <select
                  className="form-field-select"
                  id="state"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-field-group full-width">
                <label className="form-field-label">Email Address</label>
                <input
                  type="email"
                  className="form-field-input"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="form-field-group full-width">
                <label className="form-field-label">Assign to BDM</label>
                <select
                  className="form-field-select"
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                >
                  {bdms.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.employee_id || 'BDM'})
                    </option>
                  ))}
                  <option value="">-- Unassigned (Lead Pool) --</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="quick-create-footer">
          <button
            type="button"
            className="fluent-btn fluent-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="fluent-btn fluent-btn-secondary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            Save & Open Detail
          </button>
          <button
            type="button"
            className="fluent-btn fluent-btn-primary"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save and Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
