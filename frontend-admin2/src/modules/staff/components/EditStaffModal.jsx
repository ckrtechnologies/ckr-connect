import React, { useState, useEffect } from 'react';
import staffApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function EditStaffModal({ isOpen, staff, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'bdm',
    designation: '',
    target_amount: 0,
    status: 'active',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'bdm',
        designation: staff.designation || '',
        target_amount: staff.target_amount ?? 500000,
        status: staff.status || 'active',
        is_active: staff.is_active !== undefined ? staff.is_active : true,
      });
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        designation: formData.designation.trim() || undefined,
        target_amount: Number(formData.target_amount) || 0,
        status: formData.status,
        is_active: formData.is_active,
      };

      await staffApi.updateStaff(staff.id, payload);
      toast.success('Staff member updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fluent-dialog-backdrop open" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="fluent-dialog-box large-modal" onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
              Edit Staff Member
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Employee ID: <strong>{staff.employee_id || '—'}</strong>
            </div>
          </div>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-field-group">
              <label className="form-field-label">Full Name *</label>
              <input
                type="text"
                className="form-field-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="bdm">BDM (Field Sales)</option>
                <option value="telecaller">Telecaller</option>
                <option value="manager">Sales Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">Designation</label>
              <input
                type="text"
                className="form-field-input"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
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
              <label className="form-field-label">Account Status</label>
              <select
                className="form-field-select"
                value={formData.status}
                onChange={(e) => {
                  const status = e.target.value;
                  setFormData({
                    ...formData,
                    status,
                    is_active: status === 'active',
                  });
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="form-field-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-field-label">Access State</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => {
                    const is_active = e.target.checked;
                    setFormData({
                      ...formData,
                      is_active,
                      status: is_active ? 'active' : 'inactive',
                    });
                  }}
                />
                <span style={{ fontSize: '13px' }}>Allow system login</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '14px', marginTop: '16px' }}>
            <button type="button" className="fluent-btn fluent-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="fluent-btn fluent-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
