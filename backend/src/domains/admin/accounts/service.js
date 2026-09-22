import { adminAccountsRepository } from './repository.js';

export const adminAccountsService = {
  async listAccounts(search) {
    return await adminAccountsRepository.findAll(search);
  },

  async getAccountById(id) {
    const account = await adminAccountsRepository.findById(id);
    if (!account) {
      const err = new Error('Corporate account not found');
      err.statusCode = 404;
      err.code = 'ACCOUNT_NOT_FOUND';
      throw err;
    }
    return account;
  },

  async createAccount(data) {
    return await adminAccountsRepository.create(data);
  },

  async updateAccount(id, data) {
    const existing = await adminAccountsRepository.findById(id);
    if (!existing) {
      const err = new Error('Corporate account not found');
      err.statusCode = 404;
      err.code = 'ACCOUNT_NOT_FOUND';
      throw err;
    }
    return await adminAccountsRepository.update(id, data);
  }
};
