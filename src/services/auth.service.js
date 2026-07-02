import api, { unwrap } from '../lib/axios';

const authService = {
  login: async (data) => unwrap(await api.post('/auth/login', data)),
  logout: async () => unwrap(await api.post('/auth/logout')),
  getMe: async () => unwrap(await api.get('/auth/me')),
  changePassword: async (data) => unwrap(await api.post('/auth/change-password', data)),
};

export default authService;
