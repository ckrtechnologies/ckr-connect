import React, { useState } from 'react';
import staffApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function AddStaffModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    role: 'bdm',
    designation: 'Business Development Manager',
    target_amount: 500000,
    date_of_joining: '',
    temp_password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPassword, setCreatedPassword] = useState(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      employee_id: '',
      role: 'bdm',
      designation: 'Business Development Manager',
      target_amount: 500000,
      date_of_joining: '',
      temp_password: '',
    });
    setCreatedPassword(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Full Name and Work Email are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        employee_id: formData.employee_id.trim() || undefined,
        role: formData.role,
        designation: formData.designation.trim() || undefined,
        target_amount: Number(formData.target_amount) || 0,
        date_of_joining: formData.date_of_joining || undefined,
        temp_password: formData.temp_password.trim() || undefined,
      };

      const res = await staffApi.createStaff(payload);
      toast.success('Staff member created successfully');
      const pass = res?.data?.initial_password || res?.data?.temporary_password;
      if (pass) {
        setCreatedPassword(pass);
      } else {
        if (onSuccess) onSuccess();
        handleClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fluent-dialog-backdrop open" onClick={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="fluent-dialog-box large-modal" onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            Add Staff Member
          </h2>
          <button className="icon-btn-utility" onClick={handleClose} title="Close">
            ✕
          </button>
        </div>

        {createdPassword ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔑</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-success)' }}>Staff Created Successfully</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '8px 0 16px 0' }}>
              Share this temporary password with the staff member. They will be prompted to reset it upon their first login.
            </p>
            <div style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>
              {createdPassword}
            </div>
            <button
              className="fluent-btn fluent-btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => {
                navigator.clipboard.writeText(createdPassword);
                toast.success('Password copied to clipboard');
                if (onSuccess) onSuccess();
                handleClose();
              }}
            >
              Copy Password & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-field-group">
                <label className="form-field-label">Full Name *</label>
                <input
                  type="text"
                  className="form-field-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Work Email *</label>
                <input
                  type="email"
                  className="form-field-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@ckrtechnologies.in"
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Mobile Phone</label>
                <input
                  type="tel"
                  className="form-field-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Role</label>
                <select
                  className="form-field-select"
                  value={formData.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    let defaultDesignation = 'Business Development Manager';
                    if (role === 'admin') defaultDesignation = 'System Administrator';
                    if (role === 'manager') defaultDesignation = 'Sales Manager';
                    if (role === 'telecaller') defaultDesignation = 'Telecalling Executive';
                    setFormData({ ...formData, role, designation: defaultDesignation });
                  }}
                >
                  <option value="bdm">BDM</option>
                  <option value="telecaller">Telecaller</option>
                  <option value="manager">Sales Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Employee ID (leave blank to auto-generate)</label>
                <input
                  type="text"
                  className="form-field-input"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Designation</label>
                <input
                  type="text"
                  className="form-field-input"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior BDM"
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Monthly Sales Quota (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  className="form-field-input"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Date of Joining</label>
                <input
                  type="date"
                  className="form-field-input"
                  value={formData.date_of_joining}
                  onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Temporary Password (optional)</label>
                <input
                  type="text"
                  className="form-field-input"
                  value={formData.temp_password}
                  onChange={(e) => setFormData({ ...formData, temp_password: e.target.value })}
                  placeholder="Defaults to password@1"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '14px', marginTop: '16px' }}>
              <button type="button" className="fluent-btn fluent-btn-secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="fluent-btn fluent-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Staff Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
