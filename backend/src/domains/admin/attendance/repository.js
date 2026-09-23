import { db } from '../../../db/index.js';

const toTimestamp = (date, val) => {
  if (!val) return null;
  if (typeof val === 'string') {
    if (val.includes('-') && (val.includes('T') || val.includes(' '))) {
      return new Date(val).toISOString();
    }
    if (val.includes(':')) {
      const timePart = val.length === 5 ? `${val}:00` : val;
      return `${date} ${timePart}`;
    }
  }
  return val;
};

export const adminAttendanceRepository = {

  async findMonthlyRecords(year, month) {
    const { rows } = await db.query(
      `SELECT 
         a.id,
         u.id AS bdm_id,
         u.name AS bdm_name,
         u.employee_id,
         u.profile_photo_url AS avatar_url,
         u.date_of_joining::text AS date_of_joining,
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
         ed.name AS corrected_by_name,
         a.edited_at AS updated_at
       FROM connect.users u
       LEFT JOIN connect.attendance a 
         ON u.id = a.bdm_id 
         AND EXTRACT(YEAR FROM a.date) = $1 
         AND EXTRACT(MONTH FROM a.date) = $2
       LEFT JOIN connect.users ed ON a.edited_by = ed.id
       WHERE u.role = 'bdm' AND u.is_active = true
       ORDER BY u.name ASC, a.date ASC`,
      [year, month]
    );
    return rows;
  },

  async findHolidaysForMonth(year, month) {
    const { rows } = await db.query(
      `SELECT id, date::text AS date, name
       FROM connect.holidays 
       WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
       ORDER BY date ASC`,
      [year, month]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT * FROM connect.attendance WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async update(id, data, adminUserId) {
    const { rows } = await db.query(
      `UPDATE connect.attendance
       SET 
         status = $1,
         check_in_time = $2,
         check_out_time = $3,
         correction_reason = $4,
         edited_by = $5,
         edited_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        data.status,
        toTimestamp(data.date, data.punch_in || data.check_in_time),
        toTimestamp(data.date, data.punch_out || data.check_out_time),
        data.correction_reason,
        adminUserId,
        id
      ]
    );
    return rows[0];
  },

  async upsert(bdmId, date, data, adminUserId) {
    const { rows } = await db.query(
      `INSERT INTO connect.attendance (
         bdm_id, date, status, check_in_time, check_out_time, correction_reason, edited_by, edited_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (bdm_id, date) DO UPDATE 
       SET 
         status = EXCLUDED.status,
         check_in_time = EXCLUDED.check_in_time,
         check_out_time = EXCLUDED.check_out_time,
         correction_reason = EXCLUDED.correction_reason,
         edited_by = EXCLUDED.edited_by,
         edited_at = NOW()
       RETURNING *`,
      [
        bdmId,
        date,
        data.status,
        toTimestamp(date, data.punch_in || data.check_in_time),
        toTimestamp(date, data.punch_out || data.check_out_time),
        data.correction_reason,
        adminUserId
      ]
    );
    return rows[0];
  }
};
