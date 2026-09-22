import { adminDashboardService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const adminDashboardController = {
  async getSummary(req, res, next) {
    try {
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
      const data = await adminDashboardService.getDashboardSummary(year, month);
      return successResponse(res, data, 'Admin dashboard summary retrieved');
    } catch (err) {
      next(err);
    }
  }
};
