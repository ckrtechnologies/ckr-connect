import bcrypt from 'bcryptjs';
import { adminStaffRepository } from './repository.js';

export const adminStaffService = {
  async listStaff(filters) {
    return await adminStaffRepository.findAll(filters);
  },

  async getStaffById(id) {
    const staff = await adminStaffRepository.findById(id);
    if (!staff) {
      const err = new Error('Staff member not found');
      err.statusCode = 404;
      err.code = 'STAFF_NOT_FOUND';
      throw err;
    }
    return staff;
  },

  async inviteStaff(data) {
    // Check if email already in use
    const existing = await adminStaffRepository.findByEmail(data.email);
    if (existing) {
      const err = new Error('A staff member with this email already exists');
      err.statusCode = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    const tempPassword = data.temp_password || 'password@1';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const created = await adminStaffRepository.create({
      ...data,
      password_hash: passwordHash
    });

    return {
      ...created,
      initial_password: tempPassword
    };
  },

  async updateStaff(id, data) {
    const existing = await adminStaffRepository.findById(id);
    if (!existing) {
      const err = new Error('Staff member not found');
      err.statusCode = 404;
      err.code = 'STAFF_NOT_FOUND';
      throw err;
    }

    if (data.email && data.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailTaken = await adminStaffRepository.findByEmail(data.email);
      if (emailTaken) {
        const err = new Error('Another staff member is already using this email');
        err.statusCode = 409;
        err.code = 'EMAIL_EXISTS';
        throw err;
      }
    }

    return await adminStaffRepository.update(id, data);
  },

  async resetPassword(id, tempPassword = 'password@1') {
    const existing = await adminStaffRepository.findById(id);
    if (!existing) {
      const err = new Error('Staff member not found');
      err.statusCode = 404;
      err.code = 'STAFF_NOT_FOUND';
      throw err;
    }

    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const updated = await adminStaffRepository.updatePassword(id, passwordHash);
    return {
      ...updated,
      temporary_password: tempPassword
    };
  },

  async toggleActive(id, isActive) {
    const existing = await adminStaffRepository.findById(id);
    if (!existing) {
      const err = new Error('Staff member not found');
      err.statusCode = 404;
      err.code = 'STAFF_NOT_FOUND';
      throw err;
    }

    return await adminStaffRepository.toggleActive(id, isActive);
  },

  async deleteStaff(id) {
    const existing = await adminStaffRepository.findById(id);
    if (!existing) {
      const err = new Error('Staff member not found');
      err.statusCode = 404;
      err.code = 'STAFF_NOT_FOUND';
      throw err;
    }

    return await adminStaffRepository.delete(id);
  }
};
