import { db } from '../../../db/index.js';

export const bdmInteractionsRepository = {
  /**
   * Log an interaction and atomically update lead touchpoint status
   */
  async create(bdmId, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Verify the lead is assigned to this BDM
      const checkRes = await client.query(
        `SELECT id, status FROM connect.leads WHERE id = $1 AND assigned_to = $2`,
        [data.lead_id, bdmId]
      );

      if (!checkRes.rows[0]) {
        const err = new Error('Lead not found or not assigned to you');
        err.statusCode = 404;
        err.code = 'LEAD_NOT_ASSIGNED';
        throw err;
      }

      const currentLead = checkRes.rows[0];

      // Insert interaction
      const insertQuery = `
        INSERT INTO connect.lead_interactions (
          lead_id, bdm_id, type, call_result, call_result_label,
          notes, status_snapshot, next_action
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const insertValues = [
        data.lead_id,
        bdmId,
        data.type || data.channel || 'call',
        data.call_result || data.outcome || 'connected',
        data.call_result_label || null,
        data.notes || data.discussion_notes,
        currentLead.status,
        data.next_action || null
      ];

      const { rows } = await client.query(insertQuery, insertValues);
      const newInteraction = rows[0];

      // Automatically advance lead status if currently 'new'
      let newStatus = currentLead.status;
      if (currentLead.status === 'new') {
        newStatus = 'contacted';
      }

      await client.query(
        `UPDATE connect.leads
         SET 
           status = $1,
           last_followup_date = CURRENT_DATE,
           followup_count = COALESCE(followup_count, 0) + 1,
           next_followup_date = COALESCE($2, next_followup_date),
           updated_at = NOW()
         WHERE id = $3`,
        [newStatus, data.next_followup_date || data.next_action_date || null, data.lead_id]
      );

      await client.query('COMMIT');
      return newInteraction;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Find paginated interactions logged by this BDM
   */
  async findHistory(bdmId, filters = {}) {
    const { lead_id, type, channel, call_result, outcome, page = 1, limit = 25 } = filters;
    const conditions = ['i.bdm_id = $1'];
    const values = [bdmId];
    let idx = 2;

    if (lead_id) {
      conditions.push(`i.lead_id = $${idx++}`);
      values.push(lead_id);
    }
    const targetType = type || channel;
    if (targetType) {
      conditions.push(`i.type = $${idx++}`);
      values.push(targetType);
    }
    const targetOutcome = call_result || outcome;
    if (targetOutcome) {
      conditions.push(`i.call_result = $${idx++}`);
      values.push(targetOutcome);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        i.*,
        l.name AS lead_name,
        l.company_name,
        l.phone AS lead_phone
      FROM connect.lead_interactions i
      JOIN connect.leads l ON i.lead_id = l.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit, offset);
    const { rows } = await db.query(query, values);
    return rows;
  },

  /**
   * Count total interactions logged by this BDM
   */
  async countHistory(bdmId, filters = {}) {
    const { lead_id, type, channel, call_result, outcome } = filters;
    const conditions = ['i.bdm_id = $1'];
    const values = [bdmId];
    let idx = 2;

    if (lead_id) {
      conditions.push(`i.lead_id = $${idx++}`);
      values.push(lead_id);
    }
    const targetType = type || channel;
    if (targetType) {
      conditions.push(`i.type = $${idx++}`);
      values.push(targetType);
    }
    const targetOutcome = call_result || outcome;
    if (targetOutcome) {
      conditions.push(`i.call_result = $${idx++}`);
      values.push(targetOutcome);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const query = `
      SELECT COUNT(*)::int AS total
      FROM connect.lead_interactions i
      ${whereClause}
    `;

    const { rows } = await db.query(query, values);
    return rows[0]?.total || 0;
  }
};
