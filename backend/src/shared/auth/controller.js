import { authService } from './service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const authController = {
  async login(req, res, next) {
    try {
      const identifier = req.body.identifier || req.body.email;
      const { password } = req.body;
      const result = await authService.login(identifier, password);
      return successResponse(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      return successResponse(res, req.user, 'Current user profile');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      return successResponse(res, result, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, result, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  },

  async markOnboardingSeen(req, res, next) {
    try {
      const result = await authService.markOnboardingSeen(req.user.id);
      return successResponse(res, result, 'Onboarding marked as seen');
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image uploaded' });
      }
      
      const avatarUrl = `/files/avatars/${req.file.filename}`;
      const result = await authService.updateAvatar(req.user.id, avatarUrl);
      
      return successResponse(res, result, 'Avatar updated successfully');
    } catch (err) {
      next(err);
    }
  }
};
