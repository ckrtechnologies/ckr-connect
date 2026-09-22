import api from '../../core/http/client.js';

export const leadsApi = {
  listLeads: (params = {}) => api.get('/admin/leads', params),
  getLead: (id) => api.get(`/admin/leads/${id}`),
  createLead: (data) => api.post('/admin/leads', data),
  updateLead: (id, data) => api.put(`/admin/leads/${id}`, data),
  updateStatus: (id, data) => api.patch(`/admin/leads/${id}/status`, data),
  bulkAssign: (data) => api.post('/admin/leads/bulk-assign', data),
  importCsv: (formData) => api.post('/admin/leads/import-csv', formData),
  exportCsv: (params = {}) => api.get('/admin/leads/export-csv', params, { responseType: 'blob' }),
  addInteraction: (data) => api.post('/admin/interactions', data),
};

export default leadsApi;
