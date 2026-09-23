import apiClient from '../../core/http/client.js';

export const mastersApi = {
  getTags: () => apiClient.get('/admin/masters/tags'),
  createTag: (data) => apiClient.post('/admin/masters/tags', data),
  getHolidays: (params) => apiClient.get('/admin/masters/holidays', { params }),
  createHoliday: (data) => apiClient.post('/admin/masters/holidays', data),
  deleteHoliday: (id) => apiClient.delete(`/admin/masters/holidays/${id}`),
};

export default mastersApi;
