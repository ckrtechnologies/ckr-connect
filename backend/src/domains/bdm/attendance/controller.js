import { bdmAttendanceService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const bdmAttendanceController = {
  async getTodayStatus(req, res, next) {
    try {
      const data = await bdmAttendanceService.getTodayStatus(req.user.id);
      return successResponse(res, data, 'Today attendance status');
    } catch (err) {
      next(err);
    }
  },

  async punchIn(req, res, next) {
    try {
      const data = await bdmAttendanceService.punchIn(req.user.id);
      return successResponse(res, data, 'Punched in successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async punchOut(req, res, next) {
    try {
      const data = await bdmAttendanceService.punchOut(req.user.id);
      return successResponse(res, data, 'Punched out successfully');
    } catch (err) {
      next(err);
    }
  },

  async getMyHistory(req, res, next) {
    try {
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
      const data = await bdmAttendanceService.getMyHistory(req.user.id, year, month);
      return successResponse(res, data, 'Monthly attendance history');
    } catch (err) {
      next(err);
    }
  }
};
