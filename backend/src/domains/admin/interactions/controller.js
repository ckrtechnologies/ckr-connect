import { adminInteractionsService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const adminInteractionsController = {
  async listInteractions(req, res, next) {
    try {
      const data = await adminInteractionsService.listInteractions(req.query);
      return successResponse(res, data, 'Interactions ledger retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getDailySummary(req, res, next) {
    try {
      const { date } = req.query;
      const data = await adminInteractionsService.getDailySummary(date);
      return successResponse(res, data, 'Daily interactions report retrieved');
    } catch (err) {
      next(err);
    }
  }
};
