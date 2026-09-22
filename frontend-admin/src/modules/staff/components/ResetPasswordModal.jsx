import React, { useState } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import staffApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function ResetPasswordModal({ isOpen, onClose, staffMember }) {
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!staffMember?.id || !newPassword) return;

    try {
      setIsSubmitting(true);
      await staffApi.resetPassword(staffMember.id, { new_password: newPassword });
      toast.success(`Password reset for ${staffMember.full_name}`);
      onClose();
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset User Password"
      subtitle={`Set a new temporary password for ${staffMember?.full_name}`}
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
            disabled={isSubmitting || !newPassword}
          >
            {isSubmitting ? 'Resetting...' : 'Update Password'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="fluent-label">New Password *</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
            className="fluent-input"
          />
        </div>
      </form>
    </Modal>
  );
}
