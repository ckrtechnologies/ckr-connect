import { db } from '../../db/index.js';

export const bootstrapRepository = {
  async getActiveTags() {
    const { rows } = await db.query(
      `SELECT id, name, type, is_active 
       FROM connect.tags 
       WHERE is_active = true 
       ORDER BY name ASC`
    );
    return rows;
  },

  async getActiveBDMs() {
    const { rows } = await db.query(
      `SELECT id, employee_id, name, email, profile_photo_url, phone, designation, department
       FROM connect.users 
       WHERE role = 'bdm' AND is_active = true 
       ORDER BY name ASC`
    );
    return rows;
  },

  async getHolidays(year = new Date().getFullYear()) {
    const { rows } = await db.query(
      `SELECT id, date::text AS date, name 
       FROM connect.holidays 
       WHERE EXTRACT(YEAR FROM date) = $1 
       ORDER BY date ASC`,
      [year]
    );
    return rows;
  }
};
