import { adminAttendanceService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const adminAttendanceController = {
  async getMatrix(req, res, next) {
    try {
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
      const data = await adminAttendanceService.getMonthlyMatrix(year, month);
      return successResponse(res, data, 'Attendance matrix retrieved');
    } catch (err) {
      next(err);
    }
  },

  async updateAttendance(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminAttendanceService.updateAttendance(id, req.body, req.user.id);
      return successResponse(res, data, 'Attendance corrected successfully');
    } catch (err) {
      next(err);
    }
  },

  async upsertAttendance(req, res, next) {
    try {
      const { bdm_id, date } = req.body;
      const data = await adminAttendanceService.upsertAttendance(bdm_id, date, req.body, req.user.id);
      return successResponse(res, data, 'Attendance record updated successfully');
    } catch (err) {
      next(err);
    }
  }
};
