import api from '../../core/http/client.js';

export const dashboardApi = {
  getOverview: (params = {}) => api.get('/admin/dashboard', params),
};

export default dashboardApi;
