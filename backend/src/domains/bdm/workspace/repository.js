import { db } from '../../../db/index.js';

export const bdmWorkspaceRepository = {
  /**
   * Get BDM KPI metrics strictly scoped to bdmId
   */
  async getBdmMetrics(bdmId, year, month) {
    // 1. Staff target
    const staffRes = await db.query(
      `SELECT 
         u.id, 
         u.name, 
         u.employee_id, 
         u.sales_target AS target_amount,
         COALESCE(ut.daily_call_target, 15)::int AS daily_call_target
       FROM connect.users u
       LEFT JOIN connect.user_targets ut ON ut.user_id = u.id
       WHERE u.id = $1`,
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

    const lostRes = await db.query(
      `SELECT COUNT(*)::int AS lost_deals_count
       FROM connect.leads
       WHERE assigned_to = $1 
         AND status = 'lost'
         AND EXTRACT(YEAR FROM updated_at) = $2
         AND EXTRACT(MONTH FROM updated_at) = $3`,
      [bdmId, year, month]
    );
    const lostData = lostRes.rows[0];

    // 3. Active pipeline count & total value + weighted pipeline
    const pipelineRes = await db.query(
      `SELECT 
         COUNT(*)::int AS active_count,
         COALESCE(SUM(expected_value), 0)::numeric AS pipeline_value,
         COALESCE(SUM(expected_value * CASE status 
           WHEN 'proposal' THEN 0.75 
           WHEN 'follow_up' THEN 0.50 
           WHEN 'contacted' THEN 0.25 
           WHEN 'new' THEN 0.10 
           ELSE 0 END), 0)::numeric AS weighted_pipeline
       FROM connect.leads
       WHERE assigned_to = $1 
         AND status NOT IN ('won', 'lost', 'invalid')`,
      [bdmId]
    );
    const pipelineData = pipelineRes.rows[0];

    // 4. Stage matrix breakdown & counts
    const stagesRes = await db.query(
      `SELECT 
         COUNT(CASE WHEN status = 'new' AND followup_count = 0 THEN 1 END)::int AS untouched_leads_count,
         COALESCE(SUM(CASE WHEN status = 'new' AND followup_count = 0 THEN expected_value ELSE 0 END), 0)::numeric AS untouched_pipeline_value,
         COUNT(CASE WHEN status = 'contacted' THEN 1 END)::int AS contacted_leads_count,
         COALESCE(SUM(CASE WHEN status = 'contacted' THEN expected_value ELSE 0 END), 0)::numeric AS contacted_pipeline_value,
         COUNT(CASE WHEN status = 'follow_up' THEN 1 END)::int AS followup_leads_count,
         COALESCE(SUM(CASE WHEN status = 'follow_up' THEN expected_value ELSE 0 END), 0)::numeric AS followup_pipeline_value,
         COUNT(CASE WHEN status = 'proposal' THEN 1 END)::int AS proposal_leads_count,
         COALESCE(SUM(CASE WHEN status = 'proposal' THEN expected_value ELSE 0 END), 0)::numeric AS proposal_pipeline_value,
         COUNT(CASE WHEN status = 'lost' THEN 1 END)::int AS lost_leads_count,
         COUNT(*)::int AS assigned_leads_count,
         COALESCE(SUM(expected_value), 0)::numeric AS total_pipeline_value
       FROM connect.leads
       WHERE assigned_to = $1 AND status NOT IN ('invalid')`,
      [bdmId]
    );
    const stagesData = stagesRes.rows[0];

    // 5. Today's interactions count
    const todayInteractionsRes = await db.query(
      `SELECT 
         COUNT(*)::int AS total_today,
         COUNT(CASE WHEN type = 'call' AND (call_result ILIKE '%connect%' OR call_result ILIKE '%positive%' OR call_result ILIKE '%captured%') THEN 1 END)::int AS connected_calls,
         COUNT(CASE WHEN type = 'meeting' THEN 1 END)::int AS meetings
       FROM connect.lead_interactions
       WHERE bdm_id = $1 AND created_at::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
      [bdmId]
    );
    const todayInteractions = todayInteractionsRes.rows[0];

    // 6. Attendance check for today
    const attendanceRes = await db.query(
      `SELECT check_in_time, check_out_time, status
       FROM connect.attendance
       WHERE bdm_id = $1 AND date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
       ORDER BY created_at DESC
       LIMIT 1`,
      [bdmId]
    );
    const todayAttendance = attendanceRes.rows[0];

    // 7. Conversion rate and avg deal size
    const wonCount = wonData?.won_deals_count || 0;
    const lostCountThisMonth = lostData?.lost_deals_count || 0;
    const totalDecidedThisMonth = wonCount + lostCountThisMonth;
    const conversionRate = totalDecidedThisMonth > 0
      ? Math.round((wonCount / totalDecidedThisMonth) * 100)
      : (stagesData?.assigned_leads_count > 0 ? Math.round((wonCount / stagesData.assigned_leads_count) * 100) : 0);

    const wonRev = parseFloat(wonData?.won_revenue) || 0;
    const activeVal = parseFloat(pipelineData?.pipeline_value) || 0;
    const activeCnt = pipelineData?.active_count || 0;
    const avgDealSize = wonCount > 0 
      ? Math.round(wonRev / wonCount) 
      : (activeCnt > 0 ? Math.round(activeVal / activeCnt) : 0);

    return {
      bdm: staff,
      target_amount: staff?.target_amount || 0,
      daily_call_target: parseInt(staff?.daily_call_target || 15, 10),
      won_revenue: wonData?.won_revenue || 0,
      won_deals_count: wonData?.won_deals_count || 0,
      active_pipeline_count: pipelineData?.active_count || 0,
      active_pipeline_value: pipelineData?.pipeline_value || 0,
      weighted_pipeline: pipelineData?.weighted_pipeline || 0,
      avg_deal_size: avgDealSize,
      conversion_rate: conversionRate,
      ...stagesData,
      attendance_marked: Boolean(todayAttendance?.check_in_time),
      punch_in_time: todayAttendance?.check_in_time || null,
      punch_out_time: todayAttendance?.check_out_time || null,
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
        i.call_result_type,
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
