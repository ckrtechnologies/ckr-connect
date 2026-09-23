import apiClient from '../../core/http/client.js';

export const staffApi = {
  getStaff: (params) => apiClient.get('/admin/staff', { params }),
  getStaffById: (id) => apiClient.get(`/admin/staff/${id}`),
  createStaff: (data) => apiClient.post('/admin/staff', data),
  updateStaff: (id, data) => apiClient.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => apiClient.delete(`/admin/staff/${id}`),
  resetPassword: (id, temp_password) => apiClient.post(`/admin/staff/${id}/reset-password`, { temp_password }),
  toggleActive: (id, is_active) => apiClient.patch(`/admin/staff/${id}/toggle-active`, { is_active }),
};

export default staffApi;
