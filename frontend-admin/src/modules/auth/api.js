import api from '../../core/http/client.js';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (oldPassword, newPassword) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
};

export default authApi;
