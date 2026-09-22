import React, { useState } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import staffApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function InviteStaffModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'BDM',
    sales_target: '500000',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.error('Name, email, and initial password are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await staffApi.createStaff({
        ...formData,
        sales_target: Number(formData.sales_target) || 0,
      });

      toast.success('Staff member onboarded successfully');
      onSuccess && onSuccess();
      onClose();
      setFormData({
        full_name: '',
        email: '',
        role: 'BDM',
        sales_target: '500000',
        password: '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to onboard staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Staff Member"
      subtitle="Provision access for a Sales Rep (BDM) or System Admin"
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
            {isSubmitting ? 'Provisioning...' : 'Add Member'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="fluent-label">Full Name *</label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Anand Sharma"
            className="fluent-input"
          />
        </div>

        <div>
          <label className="fluent-label">Work Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="anand@ckrtechnologies.in"
            className="fluent-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="fluent-label">System Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="fluent-select"
            >
              <option value="BDM">Business Development Manager (BDM)</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div>
            <label className="fluent-label">Monthly Sales Target (₹)</label>
            <input
              type="number"
              value={formData.sales_target}
              onChange={(e) => setFormData({ ...formData, sales_target: e.target.value })}
              placeholder="e.g. 500000"
              className="fluent-input"
            />
          </div>
        </div>

        <div>
          <label className="fluent-label">Initial Password *</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 6 characters"
            className="fluent-input"
          />
        </div>
      </form>
    </Modal>
  );
}
