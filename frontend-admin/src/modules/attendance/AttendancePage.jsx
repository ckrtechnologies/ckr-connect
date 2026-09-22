import React, { useState, useEffect, useCallback } from 'react';
import attendanceApi from './api.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import AttendanceCorrectionModal from './components/AttendanceCorrectionModal.jsx';
import { toast } from '../../core/components/Toast.jsx';
import { ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matrixData, setMatrixData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selected cell for correction
  const [correctionCell, setCorrectionCell] = useState(null);

  const month = currentDate.getMonth() + 1; // 1-12
  const year = currentDate.getFullYear();

  const fetchMatrix = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await attendanceApi.getMatrix({ month, year });
      if (res?.data) {
        setMatrixData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load attendance matrix');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const daysInMonth = matrixData?.days_in_month || 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const bdms = matrixData?.bdms || [];

  const getCellConfig = (record) => {
    if (!record) return { label: '—', bg: 'transparent', color: 'var(--color-text-disabled)' };
    switch (record.status) {
      case 'PRESENT':
        return { label: 'P', bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
      case 'ABSENT':
        return { label: 'A', bg: 'var(--color-error-bg)', color: 'var(--color-error)' };
      case 'HALF_DAY':
        return { label: 'HD', bg: 'var(--color-warning-bg)', color: '#797673' };
      case 'LEAVE':
        return { label: 'L', bg: 'var(--color-info-bg)', color: 'var(--color-info)' };
      case 'HOLIDAY':
        return { label: 'H', bg: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' };
      default:
        return { label: '—', bg: 'transparent', color: 'var(--color-text-disabled)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title="Attendance Matrix"
        subtitle="Monthly BDM punch ledger & manual audit override"
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: fetchMatrix,
          },
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevMonth}
            className="fluent-btn-subtle"
            style={{ padding: '4px', cursor: 'pointer', border: 'none' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 600, fontSize: '13px', minWidth: '130px', textAlign: 'center' }}>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="fluent-btn-subtle"
            style={{ padding: '4px', cursor: 'pointer', border: 'none' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </CommandBar>

      {/* Main Matrix Container */}
      <div style={{ flex: 1, padding: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
            backgroundColor: 'var(--color-surface)',
            padding: '8px 16px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Legend:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '1px 6px', borderRadius: '2px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: 700 }}>
              P
            </span>
            <span>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '1px 6px', borderRadius: '2px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', fontWeight: 700 }}>
              A
            </span>
            <span>Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '1px 6px', borderRadius: '2px', backgroundColor: 'var(--color-warning-bg)', color: '#797673', fontWeight: 700 }}>
              HD
            </span>
            <span>Half Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '1px 6px', borderRadius: '2px', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', fontWeight: 700 }}>
              L
            </span>
            <span>Leave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '1px 6px', borderRadius: '2px', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
              H
            </span>
            <span>Holiday</span>
          </div>
          <span style={{ color: 'var(--color-text-secondary)', marginLeft: 'auto', fontSize: '11px' }}>
            * Click any cell to audit override
          </span>
        </div>

        {/* Matrix Grid */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  borderBottom: '1px solid var(--color-border)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  height: '36px',
                }}
              >
                <th
                  style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    minWidth: '180px',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'var(--color-surface-alt)',
                    zIndex: 3,
                    borderRight: '1px solid var(--color-border)',
                  }}
                >
                  BDM Name
                </th>
                {daysArray.map((day) => {
                  const dateObj = new Date(year, month - 1, day);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  return (
                    <th
                      key={day}
                      style={{
                        padding: '6px 2px',
                        minWidth: '32px',
                        fontWeight: 600,
                        color: isWeekend ? 'var(--color-error)' : 'var(--color-text-secondary)',
                        backgroundColor: isWeekend ? '#FFF0F0' : 'inherit',
                        borderRight: '1px solid var(--color-border)',
                      }}
                    >
                      <div>{day}</div>
                      <div style={{ fontSize: '9px', fontWeight: 400, opacity: 0.8 }}>
                        {dateObj.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={daysInMonth + 1} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Loading attendance matrix...
                  </td>
                </tr>
              ) : bdms.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 1} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No BDM attendance records found for this period
                  </td>
                </tr>
              ) : (
                bdms.map((bdm) => (
                  <tr
                    key={bdm.id}
                    style={{
                      height: '38px',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <td
                      style={{
                        padding: '6px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'var(--color-surface)',
                        borderRight: '1px solid var(--color-border)',
                        whiteSpace: 'nowrap',
                        zIndex: 1,
                      }}
                    >
                      {bdm.full_name}
                    </td>

                    {daysArray.map((day) => {
                      const record = bdm.records?.[day];
                      const config = getCellConfig(record);
                      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                      return (
                        <td
                          key={day}
                          onClick={() =>
                            setCorrectionCell({
                              bdmId: bdm.id,
                              bdmName: bdm.full_name,
                              date: dateStr,
                              currentRecord: record,
                            })
                          }
                          style={{
                            padding: '4px',
                            cursor: 'pointer',
                            borderRight: '1px solid var(--color-border)',
                            position: 'relative',
                            transition: 'background-color 100ms ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={
                            record
                              ? `${bdm.full_name} · ${dateStr}\nStatus: ${record.status}${
                                  record.is_edited ? `\n(Edited: ${record.edited_reason || 'Manual override'})` : ''
                                }`
                              : `Click to punch ${dateStr}`
                          }
                        >
                          <div
                            style={{
                              backgroundColor: config.bg,
                              color: config.color,
                              borderRadius: '2px',
                              padding: '2px 0',
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          >
                            {config.label}
                          </div>
                          {record?.is_edited && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                              }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {correctionCell && (
        <AttendanceCorrectionModal
          isOpen={!!correctionCell}
          onClose={() => setCorrectionCell(null)}
          cellData={correctionCell}
          onSuccess={fetchMatrix}
        />
      )}
    </div>
  );
}
