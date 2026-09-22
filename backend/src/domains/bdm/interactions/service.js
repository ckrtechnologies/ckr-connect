import { bdmInteractionsRepository } from './repository.js';

export const bdmInteractionsService = {
  async logInteraction(bdmId, data) {
    return await bdmInteractionsRepository.create(bdmId, data);
  },

  async listHistory(bdmId, queryParams) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 25));

    const filters = {
      lead_id: queryParams.lead_id,
      channel: queryParams.channel,
      outcome: queryParams.outcome,
      page,
      limit
    };

    const [items, total] = await Promise.all([
      bdmInteractionsRepository.findHistory(bdmId, filters),
      bdmInteractionsRepository.countHistory(bdmId, filters)
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
  }
};
