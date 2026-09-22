import { db } from '../../../db/index.js';

export const adminMastersRepository = {
  // --- TAGS ---
  async getAllTags() {
    const { rows } = await db.query(
      `SELECT t.*, COUNT(l.id)::int AS usage_count
       FROM connect.tags t
       LEFT JOIN connect.leads l ON t.id = l.tag_id
       GROUP BY t.id
       ORDER BY t.name ASC`
    );
    return rows;
  },

  async findTagById(id) {
    const { rows } = await db.query(
      `SELECT * FROM connect.tags WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findTagByName(name) {
    const { rows } = await db.query(
      `SELECT * FROM connect.tags WHERE LOWER(name) = LOWER($1)`,
      [name.trim()]
    );
    return rows[0] || null;
  },

  async createTag(data) {
    const { rows } = await db.query(
      `INSERT INTO connect.tags (name, type, is_active)
       VALUES ($1, $2, true)
       RETURNING *`,
      [data.name.trim(), data.type || 'product']
    );
    return rows[0];
  },

  async updateTag(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name.trim());
    }
    if (data.type !== undefined) {
      fields.push(`type = $${idx++}`);
      values.push(data.type);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(data.is_active);
    }

    if (fields.length === 0) return await this.findTagById(id);

    values.push(id);
    const query = `
      UPDATE connect.tags
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async deleteTag(id) {
    const { rows } = await db.query(`DELETE FROM connect.tags WHERE id = $1 RETURNING *`, [id]);
    return rows[0];
  },

  // --- HOLIDAYS ---
  async getAllHolidays(year = new Date().getFullYear()) {
    const { rows } = await db.query(
      `SELECT id, date::text AS date, name, created_at
       FROM connect.holidays
       WHERE EXTRACT(YEAR FROM date) = $1
       ORDER BY date ASC`,
      [year]
    );
    return rows;
  },

  async findHolidayById(id) {
    const { rows } = await db.query(
      `SELECT id, date::text AS date, name, created_at FROM connect.holidays WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findHolidayByDate(date) {
    const { rows } = await db.query(
      `SELECT id, date::text AS date, name FROM connect.holidays WHERE date = $1`,
      [date]
    );
    return rows[0] || null;
  },

  async createHoliday(data, creatorUserId) {
    const { rows } = await db.query(
      `INSERT INTO connect.holidays (date, name, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, date::text AS date, name, created_at`,
      [data.date, data.name.trim(), creatorUserId || null]
    );
    return rows[0];
  },

  async updateHoliday(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.date !== undefined) {
      fields.push(`date = $${idx++}`);
      values.push(data.date);
    }
    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name.trim());
    }

    if (fields.length === 0) return await this.findHolidayById(id);

    values.push(id);
    const query = `
      UPDATE connect.holidays
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, date::text AS date, name, created_at
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async deleteHoliday(id) {
    const { rows } = await db.query(
      `DELETE FROM connect.holidays WHERE id = $1 RETURNING id, date::text AS date, name`,
      [id]
    );
    return rows[0];
  }
};
