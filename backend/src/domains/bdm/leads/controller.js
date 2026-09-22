import { bdmLeadsService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const bdmLeadsController = {
  async listMyLeads(req, res, next) {
    try {
      const data = await bdmLeadsService.listMyLeads(req.user.id, req.query);
      return successResponse(res, data, 'Leads retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getMyLeadById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await bdmLeadsService.getMyLeadById(req.user.id, id);
      return successResponse(res, data, 'Lead detail retrieved');
    } catch (err) {
      next(err);
    }
  },

  async uploadBrd(req, res, next) {
    try {
      const { id } = req.params;
      if (!req.file) {
        const err = new Error('No document file was uploaded');
        err.statusCode = 400;
        err.code = 'NO_FILE';
        throw err;
      }
      const data = await bdmLeadsService.attachBrd(req.user.id, id, req.file);
      return successResponse(res, data, 'BRD document uploaded and attached to lead', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, lost_reason, invalid_reason, won_amount } = req.body;
      const data = await bdmLeadsService.updateStatus(req.user.id, id, status, lost_reason, invalid_reason, won_amount);
      return successResponse(res, data, 'Lead status updated');
    } catch (err) {
      next(err);
    }
  }
};
