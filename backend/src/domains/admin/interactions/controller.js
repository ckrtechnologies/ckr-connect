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
  },

  async exportCsv(req, res, next) {
    try {
      const csvString = await adminInteractionsService.exportCsv(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="interactions-ledger-${Date.now()}.csv"`);
      return res.send(csvString);
    } catch (err) {
      next(err);
    }
  },

  async logInteraction(req, res, next) {
    try {
      const data = await adminInteractionsService.logInteraction(req.body, req.user?.id);
      return successResponse(res, data, 'Interaction logged successfully', 201);
    } catch (err) {
      next(err);
    }
  }
};
