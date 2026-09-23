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
  },

  async exportCsv(queryParams) {
    const filters = {
      bdm_id: queryParams.bdm_id,
      channel: queryParams.channel,
      outcome: queryParams.outcome,
      start_date: queryParams.start_date,
      end_date: queryParams.end_date,
      search: queryParams.search,
      page: 1,
      limit: 10000
    };
    const items = await adminInteractionsRepository.findFiltered(filters);
    const headers = ['Timestamp', 'BDM Name', 'Employee ID', 'Lead / Contact', 'Company', 'Phone', 'Channel', 'Outcome', 'Notes', 'Next Followup'];
    const rows = items.map(i => [
      i.created_at || '',
      `"${(i.bdm_name || '').replace(/"/g, '""')}"`,
      i.bdm_employee_id || '',
      `"${(i.lead_name || '').replace(/"/g, '""')}"`,
      `"${(i.company_name || '').replace(/"/g, '""')}"`,
      i.lead_phone || '',
      i.channel || '',
      i.outcome || '',
      `"${(i.discussion_notes || '').replace(/"/g, '""')}"`,
      i.next_action || ''
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  async logInteraction(data, adminUserId) {
    if (!data.lead_id) {
      const err = new Error('Lead ID is required');
      err.statusCode = 400;
      err.code = 'LEAD_ID_REQUIRED';
      throw err;
    }
    return await adminInteractionsRepository.create(data, adminUserId);
  }
};
