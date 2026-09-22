import { bdmInteractionsService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const bdmInteractionsController = {
  async logInteraction(req, res, next) {
    try {
      const data = await bdmInteractionsService.logInteraction(req.user.id, req.body);
      return successResponse(res, data, 'Interaction logged successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async listHistory(req, res, next) {
    try {
      const data = await bdmInteractionsService.listHistory(req.user.id, req.query);
      return successResponse(res, data, 'Interaction history retrieved');
    } catch (err) {
      next(err);
    }
  }
};
