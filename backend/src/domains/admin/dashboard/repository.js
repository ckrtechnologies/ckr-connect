import { db } from '../../../db/index.js';

export const adminDashboardRepository = {
  /**
   * Aggregate counts of leads grouped by status
   */
  async getStatusFunnel() {
    const { rows } = await db.query(
      `SELECT 
         status, 
         COUNT(*)::int AS count,
         COALESCE(SUM(expected_value), 0)::numeric AS total_expected_value,
         COALESCE(SUM(won_amount), 0)::numeric AS total_won_amount
       FROM connect.leads
       GROUP BY status`
    );
    return rows;
  },

  /**
   * Aggregate pipeline metrics by lead status
   */
  async getPipelineByStage() {
    const { rows } = await db.query(
      `SELECT 
         status AS stage, 
         COUNT(*)::int AS lead_count,
         COALESCE(SUM(expected_value), 0)::numeric AS stage_value
       FROM connect.leads
       WHERE status NOT IN ('won', 'lost', 'invalid')
       GROUP BY status`
    );
    return rows;
  },

  /**
   * Get high-level KPI totals (total leads, active pipeline, closed revenue, win rate)
   */
  async getKpiOverview() {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*)::int AS total_leads,
         COUNT(CASE WHEN status NOT IN ('won', 'lost', 'invalid') THEN 1 END)::int AS active_pipeline_count,
         COALESCE(SUM(CASE WHEN status NOT IN ('won', 'lost', 'invalid') THEN expected_value END), 0)::numeric AS active_pipeline_value,
         COUNT(CASE WHEN status = 'won' THEN 1 END)::int AS won_count,
         COALESCE(SUM(CASE WHEN status = 'won' THEN won_amount END), 0)::numeric AS won_revenue,
         COUNT(CASE WHEN status = 'lost' THEN 1 END)::int AS lost_count,
         COUNT(CASE WHEN status = 'invalid' THEN 1 END)::int AS invalid_count,
         (SELECT COUNT(*)::int FROM connect.users WHERE role = 'bdm' AND (is_active = true OR status = 'active')) AS total_bdms,
         (SELECT COUNT(DISTINCT a.bdm_id)::int FROM connect.attendance a WHERE a.date = CURRENT_DATE AND a.status = 'present') AS present_today
       FROM connect.leads`
    );
    return rows[0];
  },

  /**
   * Monthly BDM performance leaderboard (optimized with CTE subquery aggregations)
   */
  async getBdmLeaderboard(year, month) {
    const { rows } = await db.query(
      `WITH interaction_stats AS (
         SELECT 
           bdm_id,
           COUNT(*)::int AS total_interactions,
           COUNT(CASE WHEN type = 'call' AND (call_result = 'connected' OR call_result_type = 'positive') THEN 1 END)::int AS connected_calls,
           COUNT(CASE WHEN type IN ('meeting', 'site_visit') THEN 1 END)::int AS meetings_held
         FROM connect.lead_interactions
         WHERE EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2
         GROUP BY bdm_id
       ),
       lead_stats AS (
         SELECT 
           assigned_to AS bdm_id,
           COUNT(CASE WHEN status = 'won' THEN 1 END)::int AS closed_won_deals,
           COALESCE(SUM(CASE WHEN status = 'won' THEN won_amount ELSE 0 END), 0)::numeric AS achieved_amount,
           COALESCE(SUM(CASE WHEN status NOT IN ('won', 'lost', 'invalid') THEN expected_value ELSE 0 END), 0)::numeric AS pipeline_value,
           COUNT(*)::int AS total_leads
         FROM connect.leads
         GROUP BY assigned_to
       )
       SELECT 
         u.id AS bdm_id,
         u.employee_id,
         u.name AS bdm_name,
         u.profile_photo_url AS avatar_url,
         COALESCE(u.sales_target, 500000)::numeric AS target_amount,
         COALESCE(ist.total_interactions, 0)::int AS total_interactions,
         COALESCE(ist.connected_calls, 0)::int AS connected_calls,
         COALESCE(ist.meetings_held, 0)::int AS meetings_held,
         COALESCE(lst.closed_won_deals, 0)::int AS closed_won_deals,
         COALESCE(lst.achieved_amount, 0)::numeric AS achieved_amount,
         COALESCE(lst.pipeline_value, 0)::numeric AS pipeline_value,
         COALESCE(lst.total_leads, 0)::int AS lead_count
       FROM connect.users u
       LEFT JOIN interaction_stats ist ON u.id = ist.bdm_id
       LEFT JOIN lead_stats lst ON u.id = lst.bdm_id
       WHERE u.role = 'bdm' AND (u.is_active = true OR u.status = 'active')
       ORDER BY achieved_amount DESC, closed_won_deals DESC`,
      [year, month]
    );
    return rows;
  },

  /**
   * Recent activity interactions for dashboard live feed
   */
  async getRecentInteractions(limit = 12) {
    const { rows } = await db.query(
      `SELECT 
         i.id,
         i.created_at,
         i.type AS channel,
         i.type,
         i.notes AS discussion_notes,
         i.notes,
         i.call_result AS outcome,
         i.call_result_type,
         i.next_action,
         u.name AS bdm_name,
         u.id AS bdm_id,
         l.name AS lead_name,
         l.company_name,
         l.id AS lead_id
       FROM connect.lead_interactions i
       JOIN connect.users u ON i.bdm_id = u.id
       JOIN connect.leads l ON i.lead_id = l.id
       ORDER BY i.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }
};
