import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    // Sync with adminToken for backward compatibility
    if (user?.role === 'ADMIN') {
      localStorage.setItem('adminToken', token);
    }
    set({
      user,
      token,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
      error: null,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.auth.register({ name, email, password });
      // Do not log in immediately because account is unverified
      return data;
    } catch (err) {
      set({ error: err.message || 'Înregistrarea a eșuat.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.auth.verifyEmail(token);
      get().setAuth(data.user, data.accessToken, data.refreshToken);
      return data.user;
    } catch (err) {
      set({ error: err.message || 'Verificarea emailului a eșuat.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.auth.resendVerification(email);
      return data;
    } catch (err) {
      set({ error: err.message || 'Trimiterea emailului de verificare a eșuat.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.auth.login({ email, password });
      get().setAuth(data.user, data.accessToken, data.refreshToken);
      return data.user;
    } catch (err) {
      set({ error: err.message || 'Autentificarea a eșuat.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  googleLogin: async (googleToken) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.auth.googleLogin(googleToken);
      get().setAuth(data.user, data.accessToken, data.refreshToken);
      return data.user;
    } catch (err) {
      set({ error: err.message || 'Autentificarea cu Google a eșuat.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    get().clearAuth();
  },

  getMe: async () => {
    const token = get().token;
    if (!token) return null;

    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.me();
      set({ user, isAuthenticated: true });
      if (user.role === 'ADMIN') {
        localStorage.setItem('adminToken', token);
      }
      return user;
    } catch (err) {
      get().clearAuth();
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
