import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAttendanceMatrixQuery } from '../../core/api/apiSlice.js';
import AttendanceCorrectionModal from './components/AttendanceCorrectionModal.jsx';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';

export default function AttendancePage() {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [correctionTarget, setCorrectionTarget] = useState(null);

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || new Date().getMonth() + 1;

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const formattedMonthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const { data: resData, isLoading, refetch } = useGetAttendanceMatrixQuery({ year, month });

  const matrix = Array.isArray(resData?.data?.staff_attendance)
    ? resData.data.staff_attendance
    : [];

  const totalDays = Number(resData?.data?.total_days) || 30;
  const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);

  const statusToShort = (st) => {
    switch (String(st || '').toLowerCase()) {
      case 'present': return 'P';
      case 'absent': return 'A';
      case 'half_day': return 'HD';
      case 'on_leave':
      case 'leave': return 'L';
      case 'holiday': return 'H';
      case 'weekend': return 'W';
      default: return '—';
    }
  };

  const getStatusColor = (code) => {
    switch (code) {
      case 'P': return { bg: '#DFF6DD', fg: '#107C41' };
      case 'A': return { bg: '#FDE7E9', fg: '#A80000' };
      case 'HD': return { bg: '#FFF4CE', fg: '#795B00' };
      case 'L': return { bg: '#E1DFDD', fg: '#323130' };
      case 'H': return { bg: '#EBF3FC', fg: '#0078D4' };
      case 'W': return { bg: '#EDEBE9', fg: '#605E5C' };
      default: return { bg: '#F3F2F1', fg: '#A19F9D' };
    }
  };

  const handleCellClick = (bdm, dayNum) => {
    const padDay = String(dayNum).padStart(2, '0');
    const dateStr = `${selectedMonth}-${padDay}`;
    const dayRecord = Array.isArray(bdm.days)
      ? bdm.days.find((d) => d.day_number === dayNum || d.date === dateStr)
      : null;

    setCorrectionTarget({
      bdm_id: bdm.bdm_id || bdm.id,
      bdm_name: bdm.bdm_name || bdm.name,
      date: dateStr,
      status: statusToShort(dayRecord?.status || 'absent'),
      check_in_time: dayRecord?.punch_in || '',
      check_out_time: dayRecord?.punch_out || '',
      correction_reason: dayRecord?.correction_reason || '',
    });
  };

  return (
    <>
      {/* Dynamics Command Bar (Screen A-11) */}
      <header className="dynamics-command-bar">
        <div className="command-bar-left">
          <div className="command-bar-title-section">
            <div className="command-bar-breadcrumb">
              <span className="breadcrumb-link" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                CKR Connect
              </span>
              <span className="breadcrumb-sep" style={{ color: 'var(--color-text-secondary)', margin: '0 4px' }}>
                ›
              </span>
              <span className="breadcrumb-current" style={{ color: 'var(--color-text-secondary)' }}>
                Attendance
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              Monthly Attendance Matrix · {formattedMonthLabel}
            </div>
          </div>
        </div>

        <div className="command-bar-right">
          <button
            className="fluent-btn-command"
            onClick={refetch}
            title="Refresh attendance records"
          >
            <span>🔄 Refresh</span>
          </button>
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Matrix Canvas (Screen A-11) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Active Month/Year Header Banner with Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 18px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📅</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formattedMonthLabel}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {totalDays} Days in Period · {matrix.length} Field BDM Executives Tracked
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="fluent-btn fluent-btn-secondary"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
            >
              ◀ Previous
            </button>
            <button
              type="button"
              className="fluent-btn fluent-btn-secondary"
              onClick={handleCurrentMonth}
              title="Current Month"
              style={{ height: '32px', padding: '0 12px', fontSize: '12px', fontWeight: 600 }}
            >
              Current Month
            </button>
            <button
              type="button"
              className="fluent-btn fluent-btn-secondary"
              onClick={handleNextMonth}
              title="Next Month"
              style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
            >
              Next ▶
            </button>
            <div style={{ borderLeft: '1px solid var(--color-border)', height: '24px', margin: '0 4px' }} />
            <input
              type="month"
              className="fluent-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ height: '32px', width: '135px', fontSize: '12px' }}
              title="Jump to specific month"
            />
          </div>
        </div>

        <div className="fluent-grid-container">
          <div className="fluent-grid-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Attendance Roster ({matrix.length} BDMs)
            </span>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 600, flexWrap: 'wrap' }}>
              <span style={{ background: '#DFF6DD', color: '#107C41', padding: '2px 6px', borderRadius: '4px' }}>P: Present</span>
              <span style={{ background: '#FDE7E9', color: '#A80000', padding: '2px 6px', borderRadius: '4px' }}>A: Absent</span>
              <span style={{ background: '#FFF4CE', color: '#795B00', padding: '2px 6px', borderRadius: '4px' }}>HD: Half Day</span>
              <span style={{ background: '#E1DFDD', color: '#323130', padding: '2px 6px', borderRadius: '4px' }}>L: Leave</span>
              <span style={{ background: '#EBF3FC', color: '#0078D4', padding: '2px 6px', borderRadius: '4px' }}>H: Holiday</span>
              <span style={{ background: '#EDEBE9', color: '#605E5C', padding: '2px 6px', borderRadius: '4px' }}>W: Weekend</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="fluent-grid-table" style={{ fontSize: '11px' }}>
              <thead>
                <tr>
                  <th style={{ width: '160px', position: 'sticky', left: 0, background: 'var(--color-surface)', zIndex: 2 }}>
                    BDM Executive
                  </th>
                  {dayNumbers.map((d) => (
                    <th key={d} style={{ textAlign: 'center', minWidth: '28px', padding: '4px 2px' }}>
                      {d}
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', minWidth: '40px' }}>P</th>
                  <th style={{ textAlign: 'center', minWidth: '40px' }}>A</th>
                  <th style={{ textAlign: 'center', minWidth: '40px' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={totalDays + 4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      Loading attendance matrix...
                    </td>
                  </tr>
                ) : matrix.length === 0 ? (
                  <tr>
                    <td colSpan={totalDays + 4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      No attendance data found for this period.
                    </td>
                  </tr>
                ) : (
                  matrix.map((row) => {
                    const bdmName = row.bdm_name || row.name || 'Executive';
                    const daysArr = Array.isArray(row.days) ? row.days : [];
                    const daysByNum = {};
                    daysArr.forEach((d) => {
                      daysByNum[d.day_number] = d;
                    });

                    const pCount = row.summary?.present ?? 0;
                    const aCount = row.summary?.absent ?? 0;
                    const totalWorking = pCount + aCount + (row.summary?.half_day ?? 0);
                    const pct = totalWorking > 0 ? Math.round(((pCount + (row.summary?.half_day ?? 0) * 0.5) / totalWorking) * 100) : 100;

                    return (
                      <tr key={row.bdm_id || row.id}>
                        <td style={{ position: 'sticky', left: 0, background: 'var(--color-surface)', fontWeight: 600, zIndex: 1 }}>
                          {bdmName}
                          <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>{row.employee_id}</div>
                        </td>
                        {dayNumbers.map((d) => {
                          const record = daysByNum[d];
                          const rawSt = record?.status || 'absent';
                          const code = statusToShort(rawSt);
                          const { bg, fg } = getStatusColor(code);
                          const padDay = String(d).padStart(2, '0');
                          const dateStr = `${selectedMonth}-${padDay}`;

                          return (
                            <td
                              key={d}
                              onClick={() => handleCellClick(row, d)}
                              style={{ textAlign: 'center', padding: '3px 1px', cursor: 'pointer' }}
                              title={`${dateStr} · Status: ${rawSt}${record?.punch_in ? ` · In: ${record.punch_in}` : ''}${record?.punch_out ? ` · Out: ${record.punch_out}` : ''} (Click to audit)`}
                            >
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '22px',
                                  height: '20px',
                                  lineHeight: '20px',
                                  borderRadius: '3px',
                                  background: bg,
                                  color: fg,
                                  fontWeight: 700,
                                  fontSize: '10px',
                                }}
                              >
                                {code}
                              </span>
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-success)' }}>{pCount}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-error)' }}>{aCount}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {pct}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {correctionTarget && (
        <AttendanceCorrectionModal
          isOpen={Boolean(correctionTarget)}
          cellData={correctionTarget}
          onClose={() => setCorrectionTarget(null)}
          onSuccess={refetch}
        />
      )}
    </>
  );
}
