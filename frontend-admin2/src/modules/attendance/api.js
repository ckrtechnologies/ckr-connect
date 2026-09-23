import apiClient from '../../core/http/client.js';

export const attendanceApi = {
  getMatrix: (params) => apiClient.get('/admin/attendance/matrix', { params }),
  correctAttendance: (data) => apiClient.post('/admin/attendance/correct', data),
};

export default attendanceApi;
