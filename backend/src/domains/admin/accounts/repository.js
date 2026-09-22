import { db } from '../../../db/index.js';

export const adminAccountsRepository = {
  async findAll(search = '') {
    const values = [];
    let whereClause = '';

    if (search) {
      whereClause = `WHERE a.name ILIKE $1 OR a.city ILIKE $1 OR a.state ILIKE $1`;
      values.push(`%${search}%`);
    }

    const query = `
      SELECT 
        a.id,
        a.name,
        a.state,
        a.city,
        a.created_at,
        a.updated_at,
        COUNT(DISTINCT l.id)::int AS total_leads,
        COUNT(DISTINCT CASE WHEN l.status = 'won' THEN l.id END)::int AS won_deals_count,
        COALESCE(SUM(CASE WHEN l.status = 'won' THEN l.won_amount ELSE 0 END), 0)::numeric AS lifetime_revenue
      FROM connect.accounts a
      LEFT JOIN connect.leads l ON a.id = l.account_id
      ${whereClause}
      GROUP BY a.id
      ORDER BY lifetime_revenue DESC, a.name ASC
    `;

    const { rows } = await db.query(query, values);
    return rows;
  },

  async findById(id) {
    const query = `
      SELECT 
        a.*,
        COUNT(DISTINCT l.id)::int AS total_leads,
        COUNT(DISTINCT CASE WHEN l.status = 'won' THEN l.id END)::int AS won_deals_count,
        COALESCE(SUM(CASE WHEN l.status = 'won' THEN l.won_amount ELSE 0 END), 0)::numeric AS lifetime_revenue
      FROM connect.accounts a
      LEFT JOIN connect.leads l ON a.id = l.account_id
      WHERE a.id = $1
      GROUP BY a.id
    `;
    const { rows } = await db.query(query, [id]);
    if (!rows[0]) return null;

    const account = rows[0];

    // Fetch related leads
    const leadsRes = await db.query(
      `SELECT 
         l.id, l.name, l.phone, l.email, l.status, l.expected_value, l.won_amount, l.created_at,
         u.name AS assigned_bdm_name
       FROM connect.leads l
       LEFT JOIN connect.users u ON l.assigned_to = u.id
       WHERE l.account_id = $1
       ORDER BY l.created_at DESC`,
      [id]
    );
    account.leads = leadsRes.rows;

    return account;
  },

  async create(data, creatorUserId) {
    const query = `
      INSERT INTO connect.accounts (
        name, state, city, created_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      data.name,
      data.state || null,
      data.city || null,
      creatorUserId || null
    ]);
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = ['name', 'state', 'city'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return await this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE connect.accounts
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  }
};
