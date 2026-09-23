import { db } from '../../../db/index.js';

export const adminInteractionsRepository = {
  async findFiltered(filters = {}) {
    const {
      bdm_id,
      channel,
      type,
      outcome,
      call_result,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 25
    } = filters;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (bdm_id) {
      conditions.push(`i.bdm_id = $${idx++}`);
      values.push(bdm_id);
    }
    const targetType = channel || type;
    if (targetType) {
      conditions.push(`i.type = $${idx++}`);
      values.push(targetType);
    }
    const targetOutcome = outcome || call_result;
    if (targetOutcome) {
      conditions.push(`i.call_result = $${idx++}`);
      values.push(targetOutcome);
    }
    if (start_date) {
      conditions.push(`i.created_at >= $${idx++}`);
      values.push(start_date);
    }
    if (end_date) {
      conditions.push(`i.created_at <= $${idx++}`);
      values.push(end_date);
    }
    if (search) {
      conditions.push(`(
        l.name ILIKE $${idx} OR 
        l.company_name ILIKE $${idx} OR 
        u.name ILIKE $${idx} OR 
        i.notes ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        i.id,
        i.lead_id,
        l.name AS lead_name,
        l.company_name,
        l.phone AS lead_phone,
        i.bdm_id,
        u.name AS bdm_name,
        u.employee_id AS bdm_employee_id,
        i.type AS channel,
        i.call_result AS outcome,
        i.call_result_label,
        i.notes AS discussion_notes,
        i.status_snapshot,
        i.next_action,
        i.created_at
      FROM connect.lead_interactions i
      JOIN connect.leads l ON i.lead_id = l.id
      JOIN connect.users u ON i.bdm_id = u.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit, offset);
    const { rows } = await db.query(query, values);
    return rows;
  },

  async countFiltered(filters = {}) {
    const { bdm_id, channel, type, outcome, call_result, start_date, end_date, search } = filters;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (bdm_id) {
      conditions.push(`i.bdm_id = $${idx++}`);
      values.push(bdm_id);
    }
    const targetType = channel || type;
    if (targetType) {
      conditions.push(`i.type = $${idx++}`);
      values.push(targetType);
    }
    const targetOutcome = outcome || call_result;
    if (targetOutcome) {
      conditions.push(`i.call_result = $${idx++}`);
      values.push(targetOutcome);
    }
    if (start_date) {
      conditions.push(`i.created_at >= $${idx++}`);
      values.push(start_date);
    }
    if (end_date) {
      conditions.push(`i.created_at <= $${idx++}`);
      values.push(end_date);
    }
    if (search) {
      conditions.push(`(
        l.name ILIKE $${idx} OR 
        l.company_name ILIKE $${idx} OR 
        u.name ILIKE $${idx} OR 
        i.notes ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT COUNT(*)::int AS total
      FROM connect.lead_interactions i
      JOIN connect.leads l ON i.lead_id = l.id
      JOIN connect.users u ON i.bdm_id = u.id
      ${whereClause}
    `;

    const { rows } = await db.query(query, values);
    return rows[0]?.total || 0;
  },

  async getDailySummary(date = new Date().toISOString().split('T')[0]) {
    const query = `
      SELECT 
        u.id AS bdm_id,
        u.name AS bdm_name,
        u.employee_id,
        COUNT(i.id)::int AS total_interactions,
        COUNT(CASE WHEN i.type = 'call' THEN 1 END)::int AS total_calls,
        COUNT(CASE WHEN i.call_result = 'connected' THEN 1 END)::int AS connected_calls,
        COUNT(CASE WHEN i.call_result IN ('busy', 'not_reachable', 'switched_off') THEN 1 END)::int AS missed_unreachable,
        COUNT(CASE WHEN i.call_result = 'callback_requested' THEN 1 END)::int AS callback_requests,
        COUNT(CASE WHEN i.type = 'meeting' THEN 1 END)::int AS meetings
      FROM connect.users u
      LEFT JOIN connect.lead_interactions i 
        ON u.id = i.bdm_id 
        AND i.created_at::date = $1::date
      WHERE u.role = 'bdm' AND u.is_active = true
      GROUP BY u.id, u.name, u.employee_id
      ORDER BY total_interactions DESC
    `;
    const { rows } = await db.query(query, [date]);
    return rows;
  },

  async create(data, adminUserId) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const checkRes = await client.query(
        `SELECT id, status, assigned_to FROM connect.leads WHERE id = $1`,
        [data.lead_id]
      );

      if (!checkRes.rows[0]) {
        const err = new Error('Lead not found');
        err.statusCode = 404;
        err.code = 'LEAD_NOT_FOUND';
        throw err;
      }

      const currentLead = checkRes.rows[0];
      const effectiveBdmId = data.bdm_id || currentLead.assigned_to || adminUserId;

      const insertQuery = `
        INSERT INTO connect.lead_interactions (
          lead_id, bdm_id, type, call_result, call_result_label,
          notes, status_snapshot, next_action, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `;
      const insertValues = [
        data.lead_id,
        effectiveBdmId,
        data.type || data.channel || 'call',
        data.call_result || data.outcome || 'connected',
        data.call_result_label || null,
        data.notes || data.discussion_notes || 'Activity logged',
        currentLead.status,
        data.next_action || null
      ];

      const { rows } = await client.query(insertQuery, insertValues);
      const newInteraction = rows[0];

      // Update lead touchpoints
      await client.query(
        `UPDATE connect.leads
         SET 
           last_followup_date = CURRENT_DATE,
           next_followup_date = COALESCE($1, next_followup_date),
           followup_count = COALESCE(followup_count, 0) + 1,
           updated_at = NOW()
         WHERE id = $2`,
        [data.next_followup_date || null, data.lead_id]
      );

      await client.query('COMMIT');
      return newInteraction;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
