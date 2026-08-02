import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('blinkclone_token');
      const userStr = localStorage.getItem('blinkclone_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) });
      }
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('blinkclone_token', token);
      localStorage.setItem('blinkclone_user', JSON.stringify(user));
    }
    set({ user, token });
  },

  signup: async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    const { user, token } = res.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('blinkclone_token', token);
      localStorage.setItem('blinkclone_user', JSON.stringify(user));
    }
    set({ user, token });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('blinkclone_token');
      localStorage.removeItem('blinkclone_user');
    }
    set({ user: null, token: null });
  },
}));
