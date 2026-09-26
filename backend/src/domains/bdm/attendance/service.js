import { bdmAttendanceRepository } from './repository.js';

export const bdmAttendanceService = {
  async getTodayStatus(bdmId) {
    const today = await bdmAttendanceRepository.getTodayRecord(bdmId);
    return {
      is_punched_in: Boolean(today && today.punch_in && !today.punch_out),
      is_punched_out: Boolean(today && today.punch_out),
      punch_in: today?.punch_in || null,
      punch_out: today?.punch_out || null,
      total_hours: today?.total_hours || null,
      status: today?.status || 'not_marked'
    };
  },

  async punchIn(bdmId) {
    const today = await bdmAttendanceRepository.getTodayRecord(bdmId);
    if (today && today.punch_in) {
      const err = new Error('You have already punched in for today');
      err.statusCode = 400;
      err.code = 'ALREADY_PUNCHED_IN';
      throw err;
    }
    return await bdmAttendanceRepository.punchIn(bdmId);
  },

  async punchOut(bdmId) {
    return await bdmAttendanceRepository.punchOut(bdmId);
  },

  async getMyHistory(bdmId, year, month) {
    const y = year || new Date().getFullYear();
    const m = month || new Date().getMonth() + 1;

    const daysInMonth = new Date(y, m, 0).getDate();
    const rawRecords = await bdmAttendanceRepository.getMyMonthlyRecords(bdmId, y, m);
    const holidays = await bdmAttendanceRepository.getHolidaysForMonth(y, m);
    const userJoining = await bdmAttendanceRepository.getUserJoiningDate(bdmId);

    const effectiveJoiningDate = userJoining?.date_of_joining || userJoining?.created_date || null;

    const holidayMap = new Map();
    for (const h of holidays) {
      holidayMap.set(h.date, h.name);
    }

    const recordMap = new Map();
    for (const r of rawRecords) {
      recordMap.set(r.date, r);
    }

    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];

    const summary = {
      present: 0,
      half_day: 0,
      absent: 0,
      on_leave: 0,
      holidays: 0
    };

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(y, m - 1, day).getDay();
      const isSunday = dayOfWeek === 0;
      const holidayName = holidayMap.get(dateStr);
      const record = recordMap.get(dateStr);

      let status = 'pending';
      if (holidayName) {
        status = 'holiday';
        summary.holidays++;
      } else if (isSunday) {
        status = 'weekend';
      } else if (record) {
        status = record.status;
        if (status === 'present') summary.present++;
        else if (status === 'half_day') summary.half_day++;
        else if (status === 'absent') summary.absent++;
        else if (status === 'on_leave') summary.on_leave++;
      } else if (effectiveJoiningDate && dateStr < effectiveJoiningDate) {
        status = 'not_joined';
      } else if (dateStr < todayIso) {
        status = 'absent';
        summary.absent++;
      }

      days.push({
        date: dateStr,
        day_number: day,
        day_of_week: dayOfWeek,
        is_weekend: isSunday,
        holiday_name: holidayName || null,
        status,
        punch_in: record?.punch_in || null,
        punch_out: record?.punch_out || null,
        total_hours: record?.total_hours || null,
        correction_reason: record?.correction_reason || null
      });
    }

    return {
      year: y,
      month: m,
      summary,
      days
    };
  }
};
