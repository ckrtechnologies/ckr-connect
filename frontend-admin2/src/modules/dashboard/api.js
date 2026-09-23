import apiClient from '../../core/http/client.js';

export const dashboardApi = {
  getSummary: (params) => apiClient.get('/admin/dashboard', { params }),
};

export default dashboardApi;
