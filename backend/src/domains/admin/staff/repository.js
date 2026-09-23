import { db } from '../../../db/index.js';

export const adminStaffRepository = {
  async generateEmployeeId(role = 'bdm') {
    const prefix = role === 'admin' ? 'CKR-ADM' : 'CKR-BDM';
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS count 
       FROM connect.users 
       WHERE employee_id LIKE $1`,
      [`${prefix}-%`]
    );
    const nextSeq = (rows[0]?.count || 0) + 1;
    return `${prefix}-${String(nextSeq).padStart(3, '0')}`;
  },

  async findAll(filters = {}) {
    const { role, is_active } = filters;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (role) {
      conditions.push(`u.role = $${idx++}`);
      values.push(role);
    }
    if (is_active !== undefined) {
      conditions.push(`u.is_active = $${idx++}`);
      values.push(is_active);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        u.id,
        u.employee_id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.designation,
        u.department,
        u.status,
        u.date_of_joining,
        u.profile_photo_url AS avatar_url,
        u.is_active,
        u.sales_target AS target_amount,
        u.force_password_reset,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT CASE WHEN l.status NOT IN ('won', 'lost', 'invalid') THEN l.id END)::int AS active_leads_count,
        COALESCE(SUM(CASE WHEN l.status = 'won' THEN l.won_amount ELSE 0 END), 0)::numeric AS lifetime_won_revenue
      FROM connect.users u
      LEFT JOIN connect.leads l ON u.id = l.assigned_to
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.role ASC, u.name ASC
    `;

    const { rows } = await db.query(query, values);
    return rows;
  },

  async findById(id) {
    const query = `
      SELECT 
        u.id,
        u.employee_id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.designation,
        u.department,
        u.status,
        u.date_of_joining,
        u.profile_photo_url AS avatar_url,
        u.is_active,
        u.sales_target AS target_amount,
        u.force_password_reset,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT CASE WHEN l.status NOT IN ('won', 'lost', 'invalid') THEN l.id END)::int AS active_leads_count,
        COUNT(DISTINCT CASE WHEN l.status = 'won' THEN l.id END)::int AS total_won_leads,
        COALESCE(SUM(CASE WHEN l.status = 'won' THEN l.won_amount ELSE 0 END), 0)::numeric AS lifetime_won_revenue
      FROM connect.users u
      LEFT JOIN connect.leads l ON u.id = l.assigned_to
      WHERE u.id = $1
      GROUP BY u.id
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await db.query(
      `SELECT * FROM connect.users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );
    return rows[0] || null;
  },

  async findByEmployeeId(employeeId) {
    const { rows } = await db.query(
      `SELECT * FROM connect.users WHERE UPPER(employee_id) = UPPER($1)`,
      [employeeId.trim()]
    );
    return rows[0] || null;
  },

  async create(data) {
    const employeeId = data.employee_id || (await this.generateEmployeeId(data.role));
    const query = `
      INSERT INTO connect.users (
        employee_id, name, email, phone, designation, password_hash, role, sales_target, date_of_joining, force_password_reset, status, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 'active', true)
      RETURNING id, employee_id, name, email, phone, designation, role, status, is_active, sales_target AS target_amount, created_at
    `;
    const { rows } = await db.query(query, [
      employeeId,
      data.name,
      data.email.toLowerCase().trim(),
      data.phone || null,
      data.designation || (data.role === 'admin' ? 'Administrator' : 'Business Development Manager'),
      data.password_hash,
      data.role || 'bdm',
      data.target_amount || data.sales_target || 0,
      data.date_of_joining || null
    ]);
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(data.email.toLowerCase().trim());
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.date_of_joining !== undefined) {
      fields.push(`date_of_joining = $${idx++}`);
      values.push(data.date_of_joining);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(data.role);
    }
    if (data.designation !== undefined) {
      fields.push(`designation = $${idx++}`);
      values.push(data.designation);
    }
    if (data.target_amount !== undefined || data.sales_target !== undefined) {
      fields.push(`sales_target = $${idx++}`);
      values.push(data.target_amount !== undefined ? data.target_amount : data.sales_target);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(data.is_active);
    }

    if (fields.length === 0) return await this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE connect.users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, employee_id, name, email, phone, designation, role, status, is_active, sales_target AS target_amount, updated_at
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async updatePassword(id, passwordHash) {
    const { rows } = await db.query(
      `UPDATE connect.users 
       SET password_hash = $1, force_password_reset = true, updated_at = NOW() 
       WHERE id = $2
       RETURNING id, employee_id, name, email`,
      [passwordHash, id]
    );
    return rows[0];
  },

  async toggleActive(id, isActive) {
    const status = isActive ? 'active' : 'suspended';
    const { rows } = await db.query(
      `UPDATE connect.users 
       SET is_active = $1, status = $2, updated_at = NOW() 
       WHERE id = $3
       RETURNING id, employee_id, name, email, is_active, status`,
      [isActive, status, id]
    );
    return rows[0];
  },

  async delete(id) {
    // Unassign any active leads from this staff member
    await db.query(`UPDATE connect.leads SET assigned_to = NULL WHERE assigned_to = $1`, [id]);
    try {
      const { rows } = await db.query(
        `DELETE FROM connect.users WHERE id = $1 RETURNING id, employee_id, name, email`,
        [id]
      );
      if (rows[0]) return rows[0];
    } catch (err) {
      // If historical foreign keys exist (e.g. historical interactions), gracefully soft-delete
      console.warn(`Soft-deleting staff ${id} due to constraints:`, err.message);
    }
    const { rows } = await db.query(
      `UPDATE connect.users 
       SET is_active = false, status = 'deactivated', updated_at = NOW() 
       WHERE id = $1
       RETURNING id, employee_id, name, email, is_active, status`,
      [id]
    );
    return rows[0];
  }
};
