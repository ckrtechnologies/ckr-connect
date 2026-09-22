import api from '../../core/http/client.js';

export const attendanceApi = {
  getMatrix: (params = {}) => api.get('/admin/attendance/matrix', params),
  correctAttendance: (data) => api.post('/admin/attendance/correct', data),
};

export default attendanceApi;
