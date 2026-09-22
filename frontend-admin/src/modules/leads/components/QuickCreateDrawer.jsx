import React, { useState } from 'react';
import Drawer from '../../../core/components/Drawer.jsx';
import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function QuickCreateDrawer({ isOpen, onClose, onSuccess }) {
  const { tags, bdms } = useBootstrap();

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    title: '',
    tag_id: '',
    assigned_to: '',
    expected_value: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default tag when tags load
  React.useEffect(() => {
    if (tags.length > 0 && !formData.tag_id) {
      setFormData((prev) => ({ ...prev, tag_id: tags[0].id }));
    }
  }, [tags, formData.tag_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.title.trim()) {
      toast.error('Company Name and Requirement Title are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await leadsApi.createLead({
        ...formData,
        tag_id: formData.tag_id || tags[0]?.id,
        expected_value: formData.expected_value ? Number(formData.expected_value) : 0,
      });

      toast.success('Lead created successfully');
      onSuccess && onSuccess();
      onClose();
      // Reset form
      setFormData({
        company_name: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        title: '',
        tag_id: tags[0]?.id || '',
        assigned_to: '',
        expected_value: '',
        notes: '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Create: Lead Opportunity"
      subtitle="Instantly register a prospect and assign to a sales rep"
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
            {isSubmitting ? 'Saving...' : 'Save and Close'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="fluent-label">Company / Account Name *</label>
          <input
            type="text"
            required
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="e.g. Acme Corp India Pvt Ltd"
            className="fluent-input"
          />
        </div>

        <div>
          <label className="fluent-label">Opportunity Title *</label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Enterprise Cloud ERP Migration"
            className="fluent-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="fluent-label">Primary Contact Person</label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Kumar"
              className="fluent-input"
            />
          </div>
          <div>
            <label className="fluent-label">Contact Phone</label>
            <input
              type="text"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
              className="fluent-input"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="fluent-label">Contact Email</label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="rajesh@acme.com"
              className="fluent-input"
            />
          </div>
          <div>
            <label className="fluent-label">Expected Deal Value (₹)</label>
            <input
              type="number"
              name="expected_value"
              value={formData.expected_value}
              onChange={handleChange}
              placeholder="e.g. 250000"
              className="fluent-input"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="fluent-label">Offering Service Tag *</label>
            <select
              name="tag_id"
              value={formData.tag_id}
              onChange={handleChange}
              className="fluent-select"
            >
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="fluent-label">Assign to BDM</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="fluent-select"
            >
              <option value="">Unassigned (Queue)</option>
              {bdms.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="fluent-label">Initial Notes / Requirements</label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Key discussion points, budget indicators, client background..."
            className="fluent-textarea"
          />
        </div>
      </form>
    </Drawer>
  );
}
