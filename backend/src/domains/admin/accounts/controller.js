import { adminAccountsService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const adminAccountsController = {
  async listAccounts(req, res, next) {
    try {
      const data = await adminAccountsService.listAccounts(req.query.search);
      return successResponse(res, data, 'Accounts retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getAccountById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminAccountsService.getAccountById(id);
      return successResponse(res, data, 'Account detail retrieved');
    } catch (err) {
      next(err);
    }
  },

  async createAccount(req, res, next) {
    try {
      const data = await adminAccountsService.createAccount(req.body);
      return successResponse(res, data, 'Account created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateAccount(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminAccountsService.updateAccount(id, req.body);
      return successResponse(res, data, 'Account updated successfully');
    } catch (err) {
      next(err);
    }
  }
};
