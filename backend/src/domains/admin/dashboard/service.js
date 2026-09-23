import { adminDashboardRepository } from './repository.js';

export const adminDashboardService = {
  async getDashboardSummary(year, month) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Execute sequentially over the persistent connection to avoid PgBouncer socket contention
    const kpis = await adminDashboardRepository.getKpiOverview();
    const funnel = await adminDashboardRepository.getStatusFunnel();
    const pipelineByStage = await adminDashboardRepository.getPipelineByStage();
    const leaderboard = await adminDashboardRepository.getBdmLeaderboard(currentYear, currentMonth);
    const recentInteractions = await adminDashboardRepository.getRecentInteractions(15);

    const wonCount = kpis?.won_count || 0;
    const lostCount = kpis?.lost_count || 0;
    const decidedDeals = wonCount + lostCount;
    const winRate = decidedDeals > 0 ? Number(((wonCount / decidedDeals) * 100).toFixed(1)) : 0;

    return {
      kpis: {
        ...kpis,
        win_rate_percent: winRate
      },
      funnel,
      pipeline_stages: pipelineByStage,
      leaderboard: leaderboard.map(bdm => ({
        ...bdm,
        target_achievement_percent: bdm.target_amount > 0 
          ? Number(((bdm.achieved_amount / bdm.target_amount) * 100).toFixed(1)) 
          : 0
      })),
      recent_interactions: recentInteractions
    };
  }
};
