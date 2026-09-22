import { db } from '../../../db/index.js';

export const bdmAttendanceRepository = {
  async getTodayRecord(bdmId) {
    const { rows } = await db.query(
      `SELECT 
         id,
         bdm_id,
         date::text AS date,
         check_in_time AS punch_in,
         check_out_time AS punch_out,
         status,
         correction_reason
       FROM connect.attendance 
       WHERE bdm_id = $1 AND date = CURRENT_DATE`,
      [bdmId]
    );
    return rows[0] || null;
  },

  async punchIn(bdmId) {
    const { rows } = await db.query(
      `INSERT INTO connect.attendance (bdm_id, date, check_in_time, status)
       VALUES ($1, CURRENT_DATE, NOW(), 'present')
       ON CONFLICT (bdm_id, date) DO UPDATE
       SET check_in_time = COALESCE(connect.attendance.check_in_time, NOW()),
           status = 'present'
       RETURNING id, bdm_id, date::text AS date, check_in_time AS punch_in, check_out_time AS punch_out, status`,
      [bdmId]
    );
    return rows[0];
  },

  async punchOut(bdmId) {
    const today = await this.getTodayRecord(bdmId);
    if (!today || !today.punch_in) {
      const err = new Error('You have not punched in yet today');
      err.statusCode = 400;
      err.code = 'NOT_PUNCHED_IN';
      throw err;
    }

    const { rows } = await db.query(
      `UPDATE connect.attendance
       SET 
         check_out_time = NOW()
       WHERE bdm_id = $1 AND date = CURRENT_DATE
       RETURNING id, bdm_id, date::text AS date, check_in_time AS punch_in, check_out_time AS punch_out, status`,
      [bdmId]
    );
    return rows[0];
  },

  async getMyMonthlyRecords(bdmId, year, month) {
    const { rows } = await db.query(
      `SELECT 
         a.id,
         a.date::text AS date,
         a.check_in_time AS punch_in,
         a.check_out_time AS punch_out,
         CASE 
           WHEN a.check_in_time IS NOT NULL AND a.check_out_time IS NOT NULL 
           THEN ROUND(EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time)) / 3600.0, 2)
           ELSE NULL
         END AS total_hours,
         a.status,
         a.correction_reason,
         u.name AS corrected_by_name
       FROM connect.attendance a
       LEFT JOIN connect.users u ON a.edited_by = u.id
       WHERE a.bdm_id = $1 
         AND EXTRACT(YEAR FROM a.date) = $2 
         AND EXTRACT(MONTH FROM a.date) = $3
       ORDER BY a.date ASC`,
      [bdmId, year, month]
    );
    return rows;
  },

  async getHolidaysForMonth(year, month) {
    const { rows } = await db.query(
      `SELECT id, date::text AS date, name 
       FROM connect.holidays 
       WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
       ORDER BY date ASC`,
      [year, month]
    );
    return rows;
  }
};
