import { bdmWorkspaceService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const bdmWorkspaceController = {
  async getDashboard(req, res, next) {
    try {
      const data = await bdmWorkspaceService.getDashboard(req.user.id);
      return successResponse(res, data, 'BDM workspace dashboard retrieved');
    } catch (err) {
      next(err);
    }
  }
};
