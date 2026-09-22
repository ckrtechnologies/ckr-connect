import api from '../../core/http/client.js';

export const mastersApi = {
  // Tags
  listTags: () => api.get('/admin/masters/tags'),
  createTag: (data) => api.post('/admin/masters/tags', data),
  updateTag: (id, data) => api.put(`/admin/masters/tags/${id}`, data),

  // Holidays
  listHolidays: (params = {}) => api.get('/admin/masters/holidays', params),
  createHoliday: (data) => api.post('/admin/masters/holidays', data),
  deleteHoliday: (id) => api.delete(`/admin/masters/holidays/${id}`),
};

export default mastersApi;
