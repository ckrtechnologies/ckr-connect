import apiClient from '../../core/http/client.js';

export const leadsApi = {
  getLeads: (params) => apiClient.get('/admin/leads', { params }),
  getLeadDetail: (id) => apiClient.get(`/admin/leads/${id}`),
  createLead: (data) => apiClient.post('/admin/leads', data),
  updateLead: (id, data) => apiClient.put(`/admin/leads/${id}`, data),
  deleteLead: (id) => apiClient.delete(`/admin/leads/${id}`),
  updateLeadStatus: (id, payload) =>
    apiClient.patch(`/admin/leads/${id}/status`, typeof payload === 'string' ? { status: payload } : payload),
  bulkDelete: (lead_ids) =>
    apiClient.post('/admin/leads/bulk-delete', { lead_ids }),
  bulkAssign: (lead_ids, assigned_to) =>
    apiClient.post('/admin/leads/bulk-assign', { lead_ids, assigned_to, bdm_id: assigned_to }),
  uploadBrd: (id, formData) =>
    apiClient.post(`/admin/leads/${id}/brd`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadBrd: (id, docId) =>
    apiClient.get(`/media/brd/${id}${docId ? `?doc_id=${docId}` : ''}`, { responseType: 'blob' }),
  deleteDocument: (id, docId) =>
    apiClient.delete(`/admin/leads/${id}/documents/${docId}`),
  logInteraction: (data) => apiClient.post('/admin/interactions', data),
  importCsv: (formData) =>
    apiClient.post('/admin/leads/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  exportCsv: () =>
    apiClient.get('/admin/leads/export-csv', { responseType: 'blob' }),
};

export default leadsApi;
