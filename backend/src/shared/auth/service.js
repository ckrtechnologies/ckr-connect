import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './repository.js';
import { secrets } from '../../config/secrets.js';

export const authService = {
  /**
   * Authenticate staff login and issue JWT token pair
   */
  async login(identifier, password) {
    const user = await authRepository.findByIdentifier(identifier);
    if (!user) {
      const err = new Error('Invalid email/employee ID or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (!user.is_active || user.status !== 'active') {
      const err = new Error('Account is inactive or suspended. Please contact Admin.');
      err.statusCode = 403;
      err.code = 'ACCOUNT_INACTIVE';
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const err = new Error('Invalid email/employee ID or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const tokenPayload = {
      id: user.id,
      employee_id: user.employee_id,
      name: user.name,
      email: user.email,
      role: user.role,
      force_password_reset: user.force_password_reset,
      has_seen_onboarding: user.has_seen_onboarding
    };

    const accessToken = jwt.sign(tokenPayload, secrets.jwt.secret, {
      expiresIn: secrets.jwt.expiresIn
    });

    const refreshToken = jwt.sign({ id: user.id }, secrets.jwt.refreshSecret, {
      expiresIn: secrets.jwt.refreshExpiresIn
    });

    return {
      user: tokenPayload,
      accessToken,
      refreshToken
    };
  },

  /**
   * Change password and clear force_password_reset flag
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 400;
      err.code = 'INVALID_CURRENT_PASSWORD';
      throw err;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    return await authRepository.updatePassword(userId, newHash);
  },

  /**
   * Refresh JWT token pair
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, secrets.jwt.refreshSecret);
      const user = await authRepository.findById(decoded.id);
      if (!user || !user.is_active) {
        const err = new Error('Invalid refresh token');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
      }

      const tokenPayload = {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role,
        force_password_reset: user.force_password_reset,
        has_seen_onboarding: user.has_seen_onboarding
      };

      const accessToken = jwt.sign(tokenPayload, secrets.jwt.secret, {
        expiresIn: secrets.jwt.expiresIn
      });

      return { accessToken, user: tokenPayload };
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }
  },

  /**
   * Set onboarding flag as seen
   */
  async markOnboardingSeen(userId) {
    return await authRepository.markOnboardingSeen(userId);
  }
};
