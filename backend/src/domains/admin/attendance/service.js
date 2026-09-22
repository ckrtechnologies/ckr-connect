import { adminAttendanceRepository } from './repository.js';

export const adminAttendanceService = {
  async getMonthlyMatrix(year, month) {
    const y = year || new Date().getFullYear();
    const m = month || new Date().getMonth() + 1;

    const daysInMonth = new Date(y, m, 0).getDate();
    const [rawRecords, holidays] = await Promise.all([
      adminAttendanceRepository.findMonthlyRecords(y, m),
      adminAttendanceRepository.findHolidaysForMonth(y, m)
    ]);

    const holidayMap = new Map();
    for (const h of holidays) {
      holidayMap.set(h.date, h.name);
    }

    // Group records by BDM
    const bdmMap = new Map();
    for (const row of rawRecords) {
      if (!bdmMap.has(row.bdm_id)) {
        bdmMap.set(row.bdm_id, {
          bdm_id: row.bdm_id,
          bdm_name: row.bdm_name,
          employee_id: row.employee_id,
          avatar_url: row.avatar_url,
          days: {},
          summary: {
            present: 0,
            half_day: 0,
            absent: 0,
            on_leave: 0,
            holidays: 0
          }
        });
      }
      if (row.date) {
        const bdmData = bdmMap.get(row.bdm_id);
        bdmData.days[row.date] = {
          attendance_id: row.id,
          status: row.status,
          punch_in: row.punch_in,
          punch_out: row.punch_out,
          total_hours: row.total_hours,
          correction_reason: row.correction_reason,
          corrected_by: row.corrected_by_name
        };
      }
    }

    // Build day-by-day matrix for each BDM
    const result = [];
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];

    for (const [bdmId, bdmData] of bdmMap.entries()) {
      const fullDays = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(y, m - 1, day).getDay(); // 0 is Sunday
        const isSunday = dayOfWeek === 0;
        const holidayName = holidayMap.get(dateStr);

        const existingRecord = bdmData.days[dateStr];

        let status = 'pending';
        if (holidayName) {
          status = 'holiday';
          bdmData.summary.holidays++;
        } else if (isSunday) {
          status = 'weekend';
        } else if (existingRecord) {
          status = existingRecord.status;
          if (status === 'present') bdmData.summary.present++;
          else if (status === 'half_day') bdmData.summary.half_day++;
          else if (status === 'absent') bdmData.summary.absent++;
          else if (status === 'on_leave') bdmData.summary.on_leave++;
        } else if (dateStr < todayIso) {
          status = 'absent';
          bdmData.summary.absent++;
        }

        fullDays.push({
          date: dateStr,
          day_number: day,
          day_of_week: dayOfWeek,
          is_weekend: isSunday,
          holiday_name: holidayName || null,
          status,
          punch_in: existingRecord?.punch_in || null,
          punch_out: existingRecord?.punch_out || null,
          total_hours: existingRecord?.total_hours || null,
          attendance_id: existingRecord?.attendance_id || null,
          correction_reason: existingRecord?.correction_reason || null,
          corrected_by: existingRecord?.corrected_by || null
        });
      }

      result.push({
        bdm_id: bdmData.bdm_id,
        bdm_name: bdmData.bdm_name,
        employee_id: bdmData.employee_id,
        avatar_url: bdmData.avatar_url,
        summary: bdmData.summary,
        days: fullDays
      });
    }

    return {
      year: y,
      month: m,
      total_days: daysInMonth,
      holidays,
      staff_attendance: result
    };
  },

  async updateAttendance(id, data, adminUserId) {
    const existing = await adminAttendanceRepository.findById(id);
    if (!existing) {
      const err = new Error('Attendance record not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return await adminAttendanceRepository.update(id, data, adminUserId);
  },

  async upsertAttendance(bdmId, date, data, adminUserId) {
    return await adminAttendanceRepository.upsert(bdmId, date, data, adminUserId);
  }
};
