import { db } from '../../../db/index.js';

export const bdmWorkspaceRepository = {
  /**
   * Get BDM KPI metrics strictly scoped to bdmId
   */
  async getBdmMetrics(bdmId, year, month) {
    // 1. Staff target
    const staffRes = await db.query(
      `SELECT id, name, employee_id, sales_target AS target_amount 
       FROM connect.users 
       WHERE id = $1`,
      [bdmId]
    );
    const staff = staffRes.rows[0];

    // 2. Won revenue this month
    const wonRes = await db.query(
      `SELECT 
         COUNT(*)::int AS won_deals_count,
         COALESCE(SUM(won_amount), 0)::numeric AS won_revenue
       FROM connect.leads
       WHERE assigned_to = $1 
         AND status = 'won'
         AND EXTRACT(YEAR FROM updated_at) = $2
         AND EXTRACT(MONTH FROM updated_at) = $3`,
      [bdmId, year, month]
    );
    const wonData = wonRes.rows[0];

    // 3. Active pipeline count & total value
    const pipelineRes = await db.query(
      `SELECT 
         COUNT(*)::int AS active_count,
         COALESCE(SUM(expected_value), 0)::numeric AS pipeline_value
       FROM connect.leads
       WHERE assigned_to = $1 
         AND status NOT IN ('won', 'lost', 'invalid')`,
      [bdmId]
    );
    const pipelineData = pipelineRes.rows[0];

    // 4. Today's interactions count
    const todayInteractionsRes = await db.query(
      `SELECT 
         COUNT(*)::int AS total_today,
         COUNT(CASE WHEN type = 'call' AND call_result = 'connected' THEN 1 END)::int AS connected_calls,
         COUNT(CASE WHEN type = 'meeting' THEN 1 END)::int AS meetings
       FROM connect.lead_interactions
       WHERE bdm_id = $1 AND created_at::date = CURRENT_DATE`,
      [bdmId]
    );
    const todayInteractions = todayInteractionsRes.rows[0];

    return {
      bdm: staff,
      target_amount: staff?.target_amount || 0,
      won_revenue: wonData?.won_revenue || 0,
      won_deals_count: wonData?.won_deals_count || 0,
      active_pipeline_count: pipelineData?.active_count || 0,
      active_pipeline_value: pipelineData?.pipeline_value || 0,
      today_interactions: todayInteractions
    };
  },

  /**
   * Leads requiring follow-up today (scoped to bdmId)
   */
  async getTodayFollowups(bdmId, todayStr) {
    const query = `
      SELECT 
        l.id,
        l.name AS lead_name,
        l.company_name,
        l.phone,
        l.status,
        l.expected_value,
        l.next_followup_date::text,
        latest_i.type AS last_channel,
        latest_i.call_result AS last_outcome,
        latest_i.notes AS last_notes
      FROM connect.leads l
      LEFT JOIN LATERAL (
        SELECT type, call_result, notes
        FROM connect.lead_interactions
        WHERE lead_id = l.id
        ORDER BY created_at DESC
        LIMIT 1
      ) latest_i ON true
      WHERE l.assigned_to = $1 
        AND l.status NOT IN ('won', 'lost', 'invalid')
        AND l.next_followup_date = $2::date
      ORDER BY l.expected_value DESC
    `;
    const { rows } = await db.query(query, [bdmId, todayStr]);
    return rows;
  },

  /**
   * Overdue leads (scoped to bdmId)
   */
  async getOverdueLeads(bdmId, todayStr) {
    const query = `
      SELECT 
        l.id,
        l.name AS lead_name,
        l.company_name,
        l.phone,
        l.status,
        l.expected_value,
        l.next_followup_date::text,
        latest_i.type AS last_channel,
        latest_i.call_result AS last_outcome,
        latest_i.notes AS last_notes
      FROM connect.leads l
      LEFT JOIN LATERAL (
        SELECT type, call_result, notes
        FROM connect.lead_interactions
        WHERE lead_id = l.id
        ORDER BY created_at DESC
        LIMIT 1
      ) latest_i ON true
      WHERE l.assigned_to = $1 
        AND l.status NOT IN ('won', 'lost', 'invalid')
        AND l.next_followup_date < $2::date
      ORDER BY l.next_followup_date ASC
    `;
    const { rows } = await db.query(query, [bdmId, todayStr]);
    return rows;
  },

  /**
   * Recent touchpoints logged by this BDM
   */
  async getRecentActivities(bdmId, limit = 10) {
    const query = `
      SELECT 
        i.id,
        i.lead_id,
        l.name AS lead_name,
        l.company_name,
        i.type AS channel,
        i.call_result AS outcome,
        i.notes AS discussion_notes,
        i.next_action,
        i.created_at
      FROM connect.lead_interactions i
      JOIN connect.leads l ON i.lead_id = l.id
      WHERE i.bdm_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2
    `;
    const { rows } = await db.query(query, [bdmId, limit]);
    return rows;
  }
};
