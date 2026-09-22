import { query } from '../../db/index.js';

/**
 * Shared Auth Repository - The ONLY file executing SQL queries for authentication.
 */
export const authRepository = {
  /**
   * Find staff member by email or employee_id
   * @param {string} identifier 
   */
  async findByIdentifier(identifier) {
    const text = `
      SELECT id, employee_id, name, email, phone, password_hash, role, designation, department,
             status, is_active, force_password_reset, has_seen_onboarding, sales_target
      FROM connect.users
      WHERE (LOWER(email) = LOWER($1) OR UPPER(employee_id) = UPPER($1))
      LIMIT 1;
    `;
    const res = await query(text, [identifier]);
    return res.rows[0] || null;
  },

  /**
   * Find staff member by user UUID
   * @param {string} id 
   */
  async findById(id) {
    const text = `
      SELECT id, employee_id, name, email, phone, password_hash, role, designation, department,
             status, is_active, force_password_reset, has_seen_onboarding, sales_target
      FROM connect.users
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await query(text, [id]);
    return res.rows[0] || null;
  },

  /**
   * Update password hash and clear force_password_reset flag
   * @param {string} userId 
   * @param {string} passwordHash 
   */
  async updatePassword(userId, passwordHash) {
    const text = `
      UPDATE connect.users
      SET password_hash = $2,
          force_password_reset = FALSE,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, employee_id, name, email, role, force_password_reset;
    `;
    const res = await query(text, [userId, passwordHash]);
    return res.rows[0] || null;
  },

  /**
   * Set onboarding flag as seen (for BDM welcome walkthrough)
   * @param {string} userId 
   */
  async markOnboardingSeen(userId) {
    const text = `
      UPDATE connect.users
      SET has_seen_onboarding = TRUE,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, employee_id, has_seen_onboarding;
    `;
    const res = await query(text, [userId]);
    return res.rows[0] || null;
  }
};
