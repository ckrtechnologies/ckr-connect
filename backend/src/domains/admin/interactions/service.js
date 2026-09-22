import { adminInteractionsRepository } from './repository.js';

export const adminInteractionsService = {
  async listInteractions(queryParams) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 25));

    const filters = {
      bdm_id: queryParams.bdm_id,
      channel: queryParams.channel,
      outcome: queryParams.outcome,
      start_date: queryParams.start_date,
      end_date: queryParams.end_date,
      search: queryParams.search,
      page,
      limit
    };

    const [items, total] = await Promise.all([
      adminInteractionsRepository.findFiltered(filters),
      adminInteractionsRepository.countFiltered(filters)
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getDailySummary(date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return await adminInteractionsRepository.getDailySummary(targetDate);
  }
};
