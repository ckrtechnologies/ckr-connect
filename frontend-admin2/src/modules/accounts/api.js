import apiClient from '../../core/http/client.js';

export const accountsApi = {
  getAccounts: (params) => apiClient.get('/admin/accounts', { params }),
  getAccountDetail: (id) => apiClient.get(`/admin/accounts/${id}`),
};

export default accountsApi;
