import { db } from '../../../db/index.js';

export const adminLeadsRepository = {
  /**
   * Find paginated leads with filters
   */
  async findFiltered(filters = {}) {
    const {
      status,
      source,
      assigned_to,
      tag_id,
      search,
      page = 1,
      limit = 25,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = filters;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (status && status !== 'all') {
      conditions.push(`l.status = $${idx++}`);
      values.push(status);
    }

    if (source) {
      conditions.push(`l.source = $${idx++}`);
      values.push(source);
    }

    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        conditions.push(`l.assigned_to IS NULL`);
      } else {
        conditions.push(`l.assigned_to = $${idx++}`);
        values.push(assigned_to);
      }
    }

    if (tag_id) {
      conditions.push(`l.tag_id = $${idx++}`);
      values.push(tag_id);
    }

    if (search) {
      conditions.push(`(
        l.name ILIKE $${idx} OR 
        l.company_name ILIKE $${idx} OR 
        l.email ILIKE $${idx} OR 
        l.phone ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSortFields = ['created_at', 'updated_at', 'name', 'expected_value', 'won_amount', 'status'];
    const sortField = safeSortFields.includes(sort_by) ? `l.${sort_by}` : 'l.created_at';
    const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        l.id,
        l.name,
        l.company_name,
        l.account_id,
        l.phone,
        l.email,
        l.city,
        l.state,
        l.source,
        l.tag_id,
        t.name AS tag_name,
        t.type AS tag_type,
        l.deal_type,
        l.status,
        l.priority,
        l.budget,
        l.expected_value,
        l.won_amount,
        l.assigned_to,
        u.name AS assigned_bdm_name,
        u.employee_id AS assigned_bdm_employee_id,
        l.next_followup_date::text,
        l.last_followup_date::text,
        l.followup_count,
        l.brd_url,
        l.lost_reason,
        l.invalid_reason,
        l.created_at,
        l.updated_at,
        (
          SELECT json_build_object(
            'type', i.type,
            'call_result', i.call_result,
            'notes', i.notes,
            'created_at', i.created_at
          )
          FROM connect.lead_interactions i
          WHERE i.lead_id = l.id
          ORDER BY i.created_at DESC
          LIMIT 1
        ) AS latest_interaction
      FROM connect.leads l
      LEFT JOIN connect.users u ON l.assigned_to = u.id
      LEFT JOIN connect.tags t ON l.tag_id = t.id
      ${whereClause}
      ORDER BY ${sortField} ${sortDir}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit, offset);
    const { rows } = await db.query(query, values);
    return rows;
  },

  /**
   * Count total filtered leads
   */
  async countFiltered(filters = {}) {
    const { status, source, assigned_to, tag_id, search } = filters;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (status && status !== 'all') {
      conditions.push(`l.status = $${idx++}`);
      values.push(status);
    }
    if (source) {
      conditions.push(`l.source = $${idx++}`);
      values.push(source);
    }
    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        conditions.push(`l.assigned_to IS NULL`);
      } else {
        conditions.push(`l.assigned_to = $${idx++}`);
        values.push(assigned_to);
      }
    }
    if (tag_id) {
      conditions.push(`l.tag_id = $${idx++}`);
      values.push(tag_id);
    }
    if (search) {
      conditions.push(`(
        l.name ILIKE $${idx} OR 
        l.company_name ILIKE $${idx} OR 
        l.email ILIKE $${idx} OR 
        l.phone ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT COUNT(*)::int AS total
      FROM connect.leads l
      ${whereClause}
    `;

    const { rows } = await db.query(query, values);
    return rows[0]?.total || 0;
  },

  /**
   * Find lead by ID with details and interaction history
   */
  async findById(id) {
    const query = `
      SELECT 
        l.*,
        u.name AS assigned_bdm_name,
        u.email AS assigned_bdm_email,
        u.employee_id AS assigned_bdm_employee_id,
        a.name AS account_name,
        t.name AS tag_name,
        t.type AS tag_type
      FROM connect.leads l
      LEFT JOIN connect.users u ON l.assigned_to = u.id
      LEFT JOIN connect.accounts a ON l.account_id = a.id
      LEFT JOIN connect.tags t ON l.tag_id = t.id
      WHERE l.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    if (!rows[0]) return null;

    const lead = rows[0];

    // Fetch timeline of interactions
    const interactionsQuery = `
      SELECT 
        i.*,
        usr.name AS bdm_name
      FROM connect.lead_interactions i
      JOIN connect.users usr ON i.bdm_id = usr.id
      WHERE i.lead_id = $1
      ORDER BY i.created_at DESC
    `;
    const interactionsRes = await db.query(interactionsQuery, [id]);
    lead.interactions = interactionsRes.rows;

    return lead;
  },

  /**
   * Create lead
   */
  async create(data, creatorUserId) {
    let tagId = data.tag_id;
    if (!tagId) {
      const { rows } = await db.query('SELECT id FROM connect.tags WHERE is_active = true ORDER BY name ASC LIMIT 1');
      tagId = rows[0]?.id;
    }

    let creator = creatorUserId;
    if (!creator) {
      const { rows } = await db.query("SELECT id FROM connect.users WHERE role = 'admin' LIMIT 1");
      creator = rows[0]?.id;
    }

    const query = `
      INSERT INTO connect.leads (
        name, company_name, account_id, phone, email, city, state,
        source, tag_id, sub_requirement, deal_type, assigned_to,
        status, priority, budget, expected_value, won_amount,
        next_followup_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;
    const values = [
      data.name,
      data.company_name || data.name,
      data.account_id || null,
      data.phone,
      data.email || null,
      data.city || null,
      data.state || null,
      data.source || 'website',
      tagId,
      data.sub_requirement || data.notes || null,
      data.deal_type || 'new_business',
      data.assigned_to || null,
      data.status || 'new',
      data.priority || 'medium',
      data.budget || 0,
      data.expected_value || 0,
      data.won_amount || 0,
      data.next_followup_date || null,
      creator
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  /**
   * Update lead info
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = [
      'name', 'company_name', 'account_id', 'phone', 'email', 'city', 'state',
      'source', 'tag_id', 'sub_requirement', 'deal_type', 'assigned_to',
      'status', 'priority', 'budget', 'expected_value', 'won_amount',
      'next_followup_date', 'lost_reason', 'invalid_reason'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return await this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE connect.leads
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  /**
   * Status change gate update
   */
  async updateStatus(id, status, lostReason = null, invalidReason = null, wonAmount = null) {
    const fields = [`status = $1`, `updated_at = NOW()`];
    const values = [status];
    let idx = 2;

    if (status === 'lost') {
      fields.push(`lost_reason = $${idx++}`);
      values.push(lostReason);
    } else {
      fields.push(`lost_reason = NULL`);
    }

    if (status === 'invalid') {
      fields.push(`invalid_reason = $${idx++}`);
      values.push(invalidReason);
    } else {
      fields.push(`invalid_reason = NULL`);
    }

    if (status === 'won' && wonAmount !== null && wonAmount !== undefined) {
      fields.push(`won_amount = $${idx++}`);
      values.push(wonAmount);
    }

    values.push(id);
    const query = `
      UPDATE connect.leads
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  /**
   * Bulk assign leads to a BDM
   */
  async bulkAssign(leadIds, assignedTo, adminUserId) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `UPDATE connect.leads
         SET 
           assigned_to = $1,
           updated_at = NOW()
         WHERE id = ANY($2::uuid[])
         RETURNING id, assigned_to`,
        [assignedTo, leadIds]
      );

      for (const lead of rows) {
        await client.query(
          `INSERT INTO connect.lead_assignment_history (lead_id, assigned_to, assigned_by)
           VALUES ($1, $2, $3)`,
          [lead.id, assignedTo, adminUserId || assignedTo]
        );
      }

      await client.query('COMMIT');
      return rows;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Batch insert leads from CSV
   */
  async batchCreate(leads, creatorUserId) {
    const client = await db.connect();
    const inserted = [];
    try {
      await client.query('BEGIN');
      for (const lead of leads) {
        const { rows } = await client.query(
          `INSERT INTO connect.leads (
             name, company_name, phone, email, city, state, source, expected_value, assigned_to, created_by
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            lead.name,
            lead.company_name || 'Self',
            lead.phone,
            lead.email || null,
            lead.city || null,
            lead.state || null,
            lead.source || 'website',
            lead.expected_value || 0,
            lead.assigned_to || null,
            creatorUserId || null
          ]
        );
        inserted.push(rows[0]);
      }
      await client.query('COMMIT');
      return inserted;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Delete lead by ID (cascades to interactions & assignment history)
   */
  async delete(id) {
    const { rows } = await db.query(
      `DELETE FROM connect.leads WHERE id = $1 RETURNING id, name`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Update BRD file path
   */
  async updateBrd(id, brdUrl) {
    const { rows } = await db.query(
      `UPDATE connect.leads SET brd_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [brdUrl, id]
    );
    return rows[0] || null;
  }
};
