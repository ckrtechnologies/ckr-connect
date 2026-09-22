import { bdmWorkspaceRepository } from './repository.js';

export const bdmWorkspaceService = {
  async getDashboard(bdmId) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const metrics = await bdmWorkspaceRepository.getBdmMetrics(bdmId, year, month);
    const todayFollowups = await bdmWorkspaceRepository.getTodayFollowups(bdmId, todayStr);
    const overdueLeads = await bdmWorkspaceRepository.getOverdueLeads(bdmId, todayStr);
    const recentActivities = await bdmWorkspaceRepository.getRecentActivities(bdmId, 10);

    const targetAmount = parseFloat(metrics.target_amount) || 0;
    const wonRevenue = parseFloat(metrics.won_revenue) || 0;
    const progressPercent = targetAmount > 0 
      ? Number(((wonRevenue / targetAmount) * 100).toFixed(1)) 
      : 0;

    return {
      kpis: {
        ...metrics,
        target_achievement_percent: progressPercent
      },
      today_followups: todayFollowups,
      overdue_leads: overdueLeads,
      recent_activities: recentActivities
    };
  }
};
