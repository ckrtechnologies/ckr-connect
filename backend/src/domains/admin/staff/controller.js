import { adminStaffService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const adminStaffController = {
  async listStaff(req, res, next) {
    try {
      const filters = {
        role: req.query.role,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
      };
      const data = await adminStaffService.listStaff(filters);
      return successResponse(res, data, 'Staff roster retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getStaffById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminStaffService.getStaffById(id);
      return successResponse(res, data, 'Staff detail retrieved');
    } catch (err) {
      next(err);
    }
  },

  async inviteStaff(req, res, next) {
    try {
      const data = await adminStaffService.inviteStaff(req.body);
      return successResponse(res, data, 'Staff invited successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateStaff(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminStaffService.updateStaff(id, req.body);
      return successResponse(res, data, 'Staff updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { temp_password } = req.body || {};
      const data = await adminStaffService.resetPassword(id, temp_password);
      return successResponse(res, data, 'Staff password reset successfully');
    } catch (err) {
      next(err);
    }
  },

  async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const data = await adminStaffService.toggleActive(id, is_active);
      return successResponse(res, data, `Staff ${is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      next(err);
    }
  }
};
