import { bdmLeadsRepository } from './repository.js';

export const bdmLeadsService = {
  async listMyLeads(bdmId, queryParams) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 25));

    const filters = {
      status: queryParams.status,
      tag_id: queryParams.tag_id,
      search: queryParams.search,
      page,
      limit,
      sort_by: queryParams.sort_by || 'created_at',
      sort_order: queryParams.sort_order || 'DESC'
    };

    const [items, total] = await Promise.all([
      bdmLeadsRepository.findAssignedLeads(bdmId, filters),
      bdmLeadsRepository.countAssignedLeads(bdmId, filters)
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

  async getMyLeadById(bdmId, id) {
    const lead = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!lead) {
      const err = new Error('Lead not found or not assigned to your account');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }
    return lead;
  },

  async attachBrd(bdmId, id, file) {
    const existing = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!existing) {
      const err = new Error('Lead not found or not assigned to your account');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }

    const updated = await bdmLeadsRepository.attachBrd(
      id,
      bdmId,
      file.path
    );
    return updated;
  },

  async updateStatus(bdmId, id, status, lostReason, invalidReason, wonAmount) {
    const existing = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!existing) {
      const err = new Error('Lead not found or not assigned to your account');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }

    if (status === 'lost' && (!lostReason || !lostReason.trim())) {
      const err = new Error('Lost reason is required when marking lead as Lost');
      err.statusCode = 400;
      err.code = 'LOST_REASON_REQUIRED';
      throw err;
    }

    if (status === 'invalid' && (!invalidReason || !invalidReason.trim())) {
      const err = new Error('Invalid reason is required when marking lead as Invalid');
      err.statusCode = 400;
      err.code = 'INVALID_REASON_REQUIRED';
      throw err;
    }

    if (status === 'won' && (!wonAmount || wonAmount <= 0)) {
      const err = new Error('Won amount is required when marking lead as Won');
      err.statusCode = 400;
      err.code = 'WON_AMOUNT_REQUIRED';
      throw err;
    }

    return await bdmLeadsRepository.updateStatus(id, bdmId, status, lostReason, invalidReason, wonAmount);
  }
};
