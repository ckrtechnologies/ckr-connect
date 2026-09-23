import apiClient from '../../core/http/client.js';

export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout').catch(() => {}),
};

export default authApi;
