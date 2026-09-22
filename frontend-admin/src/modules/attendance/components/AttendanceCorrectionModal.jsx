import React, { useState } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import attendanceApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

export default function AttendanceCorrectionModal({
  isOpen,
  onClose,
  cellData, // { bdmId, bdmName, date, currentRecord }
  onSuccess,
}) {
  const [status, setStatus] = useState(cellData?.currentRecord?.status || 'PRESENT');
  const [reason, setReason] = useState('');
  const [checkInTime, setCheckInTime] = useState(
    cellData?.currentRecord?.check_in_time ? cellData.currentRecord.check_in_time.slice(11, 16) : '09:30'
  );
  const [checkOutTime, setCheckOutTime] = useState(
    cellData?.currentRecord?.check_out_time ? cellData.currentRecord.check_out_time.slice(11, 16) : '18:30'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Audit justification reason is required for manual punch override');
      return;
    }

    try {
      setIsSubmitting(true);
      await attendanceApi.correctAttendance({
        user_id: cellData.bdmId,
        date: cellData.date,
        status,
        reason: reason.trim(),
        check_in_time: status === 'PRESENT' || status === 'HALF_DAY' ? `${cellData.date}T${checkInTime}:00` : null,
        check_out_time: status === 'PRESENT' ? `${cellData.date}T${checkOutTime}:00` : null,
      });

      toast.success('Attendance audit override saved');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance Punch Audit Correction"
      subtitle={`Override attendance record for ${cellData?.bdmName} on ${cellData?.date}`}
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
            {isSubmitting ? 'Saving...' : 'Apply Correction'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="fluent-label">Status Override *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="fluent-select"
            required
          >
            <option value="PRESENT">Present (P)</option>
            <option value="HALF_DAY">Half Day (HD)</option>
            <option value="LEAVE">Approved Leave (L)</option>
            <option value="ABSENT">Absent (A)</option>
          </select>
        </div>

        {(status === 'PRESENT' || status === 'HALF_DAY') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="fluent-label">Check In Time</label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="fluent-input"
              />
            </div>
            {status === 'PRESENT' && (
              <div>
                <label className="fluent-label">Check Out Time</label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="fluent-input"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="fluent-label">Mandatory Audit Justification *</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. In-field client presentation outside network coverage, approved by Manager"
            className="fluent-textarea"
          />
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
            All manual overrides are logged in the permanent audit trail with your Admin user ID.
          </span>
        </div>
      </form>
    </Modal>
  );
}
