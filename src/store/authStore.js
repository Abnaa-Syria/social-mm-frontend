import { create } from 'zustand';
import { storage } from '../lib/storage';
import authService from '../services/auth.service';

const useAuthStore = create((set, get) => ({
  user: storage.getUser(),
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const result = await authService.login(credentials);
      storage.setToken(result.token);
      storage.setUser(result.user);
      set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    storage.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!storage.getToken()) return null;
    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      storage.setUser(user);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch {
      storage.clear();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  getPermissions: () => {
    const user = get().user;
    if (!user?.permissions) return [];
    return user.permissions.map((p) => (typeof p === 'string' ? p : p.slug));
  },
}));

export default useAuthStore;
