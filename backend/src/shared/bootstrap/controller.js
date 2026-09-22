import { bootstrapService } from './service.js';
import { successResponse } from '../../utils/response.js';

export const bootstrapController = {
  async getBootstrap(req, res, next) {
    try {
      const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
      const data = await bootstrapService.getBootstrapData(year);
      return successResponse(res, data, 'Bootstrap data retrieved');
    } catch (err) {
      next(err);
    }
  }
};
