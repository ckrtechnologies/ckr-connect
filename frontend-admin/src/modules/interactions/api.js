import api from '../../core/http/client.js';

export const interactionsApi = {
  listInteractions: (params = {}) => api.get('/admin/interactions', params),
  getDailySummary: (params = {}) => api.get('/admin/interactions/daily-summary', params),
};

export default interactionsApi;
