import { db } from '../../db/index.js';

export const mediaRepository = {
  async getLeadBrdInfo(leadId) {
    const { rows } = await db.query(
      `SELECT id, name AS lead_name, assigned_to, brd_url 
       FROM connect.leads 
       WHERE id = $1`,
      [leadId]
    );
    return rows[0] || null;
  }
};
