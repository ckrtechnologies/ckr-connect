import { db } from '../../../db/index.js';

export const bdmLeadsRepository = {
  /**
   * Find paginated leads strictly assigned to this BDM
   */
  async findAssignedLeads(bdmId, filters = {}) {
    const {
      status,
      priority,
      urgency,
      tag_id,
      tags,
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
      const normalizedStatus = status.trim().toLowerCase().replace(/-/g, '_');
      if (normalizedStatus === 'active') {
        conditions.push(`l.status NOT IN ('won', 'lost', 'invalid')`);
      } else if (normalizedStatus === 'follow_up' || normalizedStatus === 'followup') {
        conditions.push(`(LOWER(l.status::text) = 'followup' OR (l.next_followup_date IS NOT NULL AND l.status NOT IN ('won', 'lost', 'invalid')))`);
      } else {
        conditions.push(`LOWER(l.status::text) = $${idx++}`);
        values.push(normalizedStatus);
      }
    }

    if (priority && priority !== 'all') {
      conditions.push(`LOWER(l.priority::text) = $${idx++}`);
      values.push(priority.trim().toLowerCase());
    }

    if (urgency && urgency !== 'all') {
      const normUrgency = urgency.trim().toLowerCase();
      if (normUrgency === 'overdue') {
        conditions.push(`(l.next_followup_date < CURRENT_TIMESTAMP AND l.status NOT IN ('won', 'lost', 'invalid'))`);
      } else if (normUrgency === 'today') {
        conditions.push(`(l.next_followup_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AND l.status NOT IN ('won', 'lost', 'invalid'))`);
      } else if (normUrgency === 'upcoming') {
        conditions.push(`(l.next_followup_date > CURRENT_TIMESTAMP AND l.status NOT IN ('won', 'lost', 'invalid'))`);
      } else if (normUrgency === 'won') {
        conditions.push(`l.status = 'won'`);
      }
    }

    const filterTags = tags || (tag_id ? [tag_id] : null);
    if (filterTags && filterTags.length > 0) {
      conditions.push(`l.id IN (SELECT lead_id FROM connect.lead_tags WHERE tag_id = ANY($${idx++}))`);
      values.push(filterTags);
    }

    if (search && search.trim()) {
      let searchPattern = search.trim();
      if (searchPattern.includes('*')) {
        searchPattern = searchPattern.replace(/\*/g, '%');
      } else if (!searchPattern.includes('%')) {
        searchPattern = `%${searchPattern}%`;
      }
      conditions.push(`(
        l.name ILIKE $${idx} OR 
        l.company_name ILIKE $${idx} OR 
        l.email ILIKE $${idx} OR 
        l.phone ILIKE $${idx} OR
        l.city ILIKE $${idx} OR
        l.state ILIKE $${idx} OR
        l.sub_requirement ILIKE $${idx}
      )`);
      values.push(searchPattern);
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
        (l.next_followup_date IS NOT NULL AND l.next_followup_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AND l.status NOT IN ('won', 'lost', 'invalid')) AS is_overdue,
        (l.next_followup_date IS NOT NULL AND l.next_followup_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AND l.status NOT IN ('won', 'lost', 'invalid')) AS is_due_today,
        (
          SELECT COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name, 'type', t.type, 'color_hex', t.color_hex)), '[]'::json)
          FROM connect.lead_tags lt
          JOIN connect.tags t ON lt.tag_id = t.id
          WHERE lt.lead_id = l.id
        ) AS tags,
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
    const { status, tag_id, tags, search } = filters;
    const conditions = ['l.assigned_to = $1'];
    const values = [bdmId];
    let idx = 2;

    if (status && status !== 'all') {
      if (status.toLowerCase() === 'active') {
        conditions.push(`l.status NOT IN ('won', 'lost', 'invalid')`);
      } else {
        conditions.push(`LOWER(l.status::text) = LOWER($${idx++})`);
        values.push(status.trim().replace('-', '_'));
      }
    }
    const filterTags = tags || (tag_id ? [tag_id] : null);
    if (filterTags && filterTags.length > 0) {
      conditions.push(`l.id IN (SELECT lead_id FROM connect.lead_tags WHERE tag_id = ANY($${idx++}))`);
      values.push(filterTags);
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
        (l.next_followup_date IS NOT NULL AND l.next_followup_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AND l.status NOT IN ('won', 'lost', 'invalid')) AS is_overdue,
        (l.next_followup_date IS NOT NULL AND l.next_followup_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AND l.status NOT IN ('won', 'lost', 'invalid')) AS is_due_today,
        (
          SELECT COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name, 'type', t.type, 'color_hex', t.color_hex)), '[]'::json)
          FROM connect.lead_tags lt
          JOIN connect.tags t ON lt.tag_id = t.id
          WHERE lt.lead_id = l.id
        ) AS tags
      FROM connect.leads l
      LEFT JOIN connect.accounts a ON l.account_id = a.id
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
   * Update status with lost_reason / invalid_reason / won_amount / next_followup_date
   */
  async updateStatus(
    id,
    bdmId,
    status,
    lostReason = null,
    invalidReason = null,
    wonAmount = null,
    nextFollowupDate = null,
    remarks = null
  ) {
    const normalizedStatus = (status || '').toLowerCase().trim();
    const fields = [`status = $1`, `updated_at = NOW()`];
    const values = [normalizedStatus];
    let idx = 2;

    const terminalStatuses = ['won', 'lost', 'invalid'];
    if (terminalStatuses.includes(normalizedStatus)) {
      fields.push(`next_followup_date = NULL`);
    } else if (nextFollowupDate) {
      fields.push(`next_followup_date = $${idx++}`);
      values.push(nextFollowupDate);
    }

    if (normalizedStatus === 'lost') {
      fields.push(`lost_reason = $${idx++}`);
      values.push(lostReason);
    } else {
      fields.push(`lost_reason = NULL`);
    }

    if (normalizedStatus === 'invalid') {
      fields.push(`invalid_reason = $${idx++}`);
      values.push(invalidReason);
    } else {
      fields.push(`invalid_reason = NULL`);
    }

    if (normalizedStatus === 'won' && wonAmount !== null && wonAmount !== undefined) {
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
    const updatedLead = rows[0] || null;

    if (updatedLead && (remarks || !terminalStatuses.includes(normalizedStatus))) {
      try {
        const noteText = remarks || `Stage advanced to ${normalizedStatus.toUpperCase().replace('_', ' ')}`;
        const nextActionNote = nextFollowupDate
          ? `Follow-up callback scheduled for ${new Date(nextFollowupDate).toLocaleString('en-IN')}`
          : undefined;

        await db.query(
          `INSERT INTO connect.lead_interactions (
            lead_id, bdm_id, type, notes, call_result, call_result_type, status_snapshot, next_action
          ) VALUES ($1, $2, 'note', $3, $4, 'positive', $5, $6)`,
          [
            id,
            bdmId,
            noteText,
            `Stage: ${normalizedStatus.replace('_', ' ').toUpperCase()}`,
            normalizedStatus,
            nextActionNote || null
          ]
        );
      } catch (err) {
        console.warn('[BDM Leads Repo] Non-critical interaction insert on status update:', err.message);
      }
    }

    return updatedLead;
  },

  /**
   * Update core lead details
   */
  async updateDetails(id, bdmId, updateData) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (['name', 'company_name', 'email', 'phone', 'city', 'state', 'expected_value', 'budget', 'priority', 'sub_requirement'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;
    
    fields.push(`updated_at = NOW()`);
    
    const query = `
      UPDATE connect.leads
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND assigned_to = $${idx++}
      RETURNING *
    `;
    
    values.push(id, bdmId);
    
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }
};
