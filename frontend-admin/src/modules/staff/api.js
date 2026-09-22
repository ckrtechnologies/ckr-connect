import api from '../../core/http/client.js';

export const staffApi = {
  listStaff: (params = {}) => api.get('/admin/staff', params),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  resetPassword: (id, data) => api.post(`/admin/staff/${id}/reset-password`, data),
};

export default staffApi;
