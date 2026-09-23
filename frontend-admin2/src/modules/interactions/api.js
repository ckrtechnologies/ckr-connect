import apiClient from '../../core/http/client.js';

export const interactionsApi = {
  getInteractions: (params) => apiClient.get('/admin/interactions', { params }),
  getDailySummary: (params) => apiClient.get('/admin/interactions/daily-summary', { params }),
  exportCsv: (params) => apiClient.get('/admin/interactions/export-csv', { params, responseType: 'blob' }),
};

export default interactionsApi;
