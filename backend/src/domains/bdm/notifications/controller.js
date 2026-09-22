import { bdmNotificationsService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const bdmNotificationsController = {
  async getFeed(req, res, next) {
    try {
      const data = await bdmNotificationsService.getFeed(req.user.id);
      return successResponse(res, data, 'Notification feed retrieved');
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const data = await bdmNotificationsService.markAsRead(id, req.user.id);
      return successResponse(res, data, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const data = await bdmNotificationsService.markAllAsRead(req.user.id);
      return successResponse(res, data, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
};
