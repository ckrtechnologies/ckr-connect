import api from '../../core/http/client.js';

export const accountsApi = {
  listAccounts: (params = {}) => api.get('/admin/accounts', params),
  getAccount: (id) => api.get(`/admin/accounts/${id}`),
};

export default accountsApi;
