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
         COUNT(CASE WHEN status = 'invalid' THEN 1 END)::int AS invalid_count
       FROM connect.leads`
    );
    return rows[0];
  },

  /**
   * Monthly BDM performance leaderboard
   */
  async getBdmLeaderboard(year, month) {
    const { rows } = await db.query(
      `SELECT 
         u.id AS bdm_id,
         u.employee_id,
         u.name AS bdm_name,
         u.profile_photo_url AS avatar_url,
         u.sales_target AS target_amount,
         COALESCE(COUNT(DISTINCT i.id), 0)::int AS total_interactions,
         COALESCE(COUNT(DISTINCT CASE WHEN i.type = 'call' AND i.call_result = 'connected' THEN i.id END), 0)::int AS connected_calls,
         COALESCE(COUNT(DISTINCT CASE WHEN i.type = 'meeting' THEN i.id END), 0)::int AS meetings_held,
         COALESCE(COUNT(DISTINCT CASE WHEN l.status = 'won' THEN l.id END), 0)::int AS closed_won_deals,
         COALESCE(SUM(CASE WHEN l.status = 'won' THEN l.won_amount ELSE 0 END), 0)::numeric AS achieved_amount
       FROM connect.users u
       LEFT JOIN connect.lead_interactions i 
         ON u.id = i.bdm_id 
         AND EXTRACT(YEAR FROM i.created_at) = $1 
         AND EXTRACT(MONTH FROM i.created_at) = $2
       LEFT JOIN connect.leads l 
         ON u.id = l.assigned_to 
         AND EXTRACT(YEAR FROM l.updated_at) = $1 
         AND EXTRACT(MONTH FROM l.updated_at) = $2
       WHERE u.role = 'bdm' AND u.is_active = true
       GROUP BY u.id, u.employee_id, u.name, u.profile_photo_url, u.sales_target
       ORDER BY achieved_amount DESC, closed_won_deals DESC`,
      [year, month]
    );
    return rows;
  }
};
