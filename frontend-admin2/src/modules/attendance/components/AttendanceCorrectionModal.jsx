import React, { useState } from 'react';
import attendanceApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';

const STATUS_MAP_FROM_CODE = {
  P: 'present',
  A: 'absent',
  HD: 'half_day',
  L: 'on_leave',
  H: 'holiday',
  present: 'present',
  absent: 'absent',
  half_day: 'half_day',
  on_leave: 'on_leave',
  holiday: 'holiday',
};

export default function AttendanceCorrectionModal({ isOpen, cellData, onClose, onSuccess }) {
  const initialStatus = STATUS_MAP_FROM_CODE[cellData?.status] || 'present';
  const [status, setStatus] = useState(initialStatus);

  const formatTimeVal = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && val.includes(':')) {
      const parts = val.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return '';
  };

  const [checkInTime, setCheckInTime] = useState(formatTimeVal(cellData?.punch_in || cellData?.check_in_time));
  const [checkOutTime, setCheckOutTime] = useState(formatTimeVal(cellData?.punch_out || cellData?.check_out_time));
  const [remarks, setRemarks] = useState(cellData?.correction_reason || cellData?.remarks || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !cellData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'present' && (!checkInTime || !checkOutTime)) {
      toast.error('Punch In and Punch Out times are required when marking as Present');
      return;
    }

    if (!remarks.trim() || remarks.trim().length < 5) {
      toast.error('Audit justification remarks must be at least 5 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await attendanceApi.correctAttendance({
        bdm_id: cellData.bdm_id,
        date: cellData.date,
        status,
        check_in_time: checkInTime ? `${checkInTime}:00` : null,
        check_out_time: checkOutTime ? `${checkOutTime}:00` : null,
        punch_in: checkInTime ? `${checkInTime}:00` : null,
        punch_out: checkOutTime ? `${checkOutTime}:00` : null,
        correction_reason: remarks.trim(),
        remarks: remarks.trim(),
      });

      toast.success('Punch audit correction recorded');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to correct attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fluent-dialog-backdrop open" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="fluent-dialog-box" onClick={(e) => e.stopPropagation()} style={{ width: '480px', maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
            Punch Audit Edit · {cellData.bdm_name}
          </h2>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Date: <strong>{cellData.date}</strong> · Current Status: <strong>{cellData.status}</strong>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Override Status</label>
            <select
              className="form-field-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="present">Present</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
              <option value="on_leave">Leave</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-field-group">
              <label className="form-field-label">Punch In Time</label>
              <input
                type="time"
                className="form-field-input"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div className="form-field-group">
              <label className="form-field-label">Punch Out Time</label>
              <input
                type="time"
                className="form-field-input"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Audit Justification Remarks *</label>
            <textarea
              className="form-field-textarea"
              required
              rows={3}
              placeholder="Explain reason for manual attendance correction..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
            <button type="button" className="fluent-btn fluent-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="fluent-btn fluent-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Apply Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
