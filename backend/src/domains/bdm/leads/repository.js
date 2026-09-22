import { db } from '../../../db/index.js';

export const bdmLeadsRepository = {
  /**
   * Find paginated leads strictly assigned to this BDM
   */
  async findAssignedLeads(bdmId, filters = {}) {
    const {
      status,
      tag_id,
      search,
      page = 1,
      limit = 25,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = filters;

    const conditions = ['l.assigned_to = $1'];
    const values = [bdmId];
    let idx = 2;

    if (status && status !== 'all') {
      conditions.push(`l.status = $${idx++}`);
      values.push(status);
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

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const safeSortFields = ['created_at', 'updated_at', 'name', 'expected_value', 'won_amount', 'status'];
    const sortField = safeSortFields.includes(sort_by) ? `l.${sort_by}` : 'l.created_at';
    const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        l.id,
        l.name,
        l.company_name,
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
   * Count total leads strictly assigned to this BDM
   */
  async countAssignedLeads(bdmId, filters = {}) {
    const { status, tag_id, search } = filters;
    const conditions = ['l.assigned_to = $1'];
    const values = [bdmId];
    let idx = 2;

    if (status && status !== 'all') {
      conditions.push(`l.status = $${idx++}`);
      values.push(status);
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

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const query = `
      SELECT COUNT(DISTINCT l.id)::int AS total
      FROM connect.leads l
      ${whereClause}
    `;

    const { rows } = await db.query(query, values);
    return rows[0]?.total || 0;
  },

  /**
   * Get single lead by ID, verifying assignment
   */
  async findByIdAndBdm(id, bdmId) {
    const query = `
      SELECT 
        l.*,
        a.name AS account_name,
        t.name AS tag_name,
        t.type AS tag_type
      FROM connect.leads l
      LEFT JOIN connect.accounts a ON l.account_id = a.id
      LEFT JOIN connect.tags t ON l.tag_id = t.id
      WHERE l.id = $1 AND l.assigned_to = $2
    `;
    const { rows } = await db.query(query, [id, bdmId]);
    if (!rows[0]) return null;

    const lead = rows[0];

    // Fetch timeline of interactions
    const interactionsRes = await db.query(
      `SELECT i.*, u.name AS bdm_name
       FROM connect.lead_interactions i
       JOIN connect.users u ON i.bdm_id = u.id
       WHERE i.lead_id = $1
       ORDER BY i.created_at DESC`,
      [id]
    );
    lead.interactions = interactionsRes.rows;

    return lead;
  },

  /**
   * Update BRD file URL
   */
  async attachBrd(id, bdmId, fileUrl) {
    const query = `
      UPDATE connect.leads
      SET 
        brd_url = $1,
        updated_at = NOW()
      WHERE id = $2 AND assigned_to = $3
      RETURNING *
    `;
    const { rows } = await db.query(query, [fileUrl, id, bdmId]);
    return rows[0] || null;
  },

  /**
   * Update status with lost_reason / invalid_reason / won_amount
   */
  async updateStatus(id, bdmId, status, lostReason = null, invalidReason = null, wonAmount = null) {
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

    values.push(id, bdmId);
    const query = `
      UPDATE connect.leads
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND assigned_to = $${idx}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }
};
