import { bdmNotificationsRepository } from './repository.js';

export const bdmNotificationsService = {
  async getFeed(recipientId) {
    const [items, unreadCount] = await Promise.all([
      bdmNotificationsRepository.getNotifications(recipientId, 25),
      bdmNotificationsRepository.getUnreadCount(recipientId)
    ]);
    return {
      unread_count: unreadCount,
      items
    };
  },

  async markAsRead(id, recipientId) {
    const updated = await bdmNotificationsRepository.markAsRead(id, recipientId);
    if (!updated) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return updated;
  },

  async markAllAsRead(recipientId) {
    const updated = await bdmNotificationsRepository.markAllAsRead(recipientId);
    return { marked_count: updated.length };
  }
};
