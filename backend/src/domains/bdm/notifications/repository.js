import { db } from '../../../db/index.js';

export const bdmNotificationsRepository = {
  async getNotifications(userId, limit = 20) {
    const { rows } = await db.query(
      `SELECT * FROM connect.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  },

  async getUnreadCount(userId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS count 
       FROM connect.notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return rows[0]?.count || 0;
  },

  async markAsRead(id, userId) {
    const { rows } = await db.query(
      `UPDATE connect.notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async markAllAsRead(userId) {
    const { rows } = await db.query(
      `UPDATE connect.notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [userId]
    );
    return rows;
  },

  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO connect.notifications (
         user_id, lead_id, type, message
       ) VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.user_id,
        data.lead_id || null,
        data.type || 'system',
        data.message
      ]
    );
    return rows[0];
  }
};
