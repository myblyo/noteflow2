import { create } from "zustand";
import * as api from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/token";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

interface AuthStore {
  user: AuthUser | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isReady: false,
  isLoading: false,
  error: null,

  init: async () => {
    const token = await getToken();
    api.setAuthToken(token);
    set({ isReady: true });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await api.login(email, password);
      await setToken(token);
      api.setAuthToken(token);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al iniciar sesión",
      });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await api.register(name, email, password);
      await setToken(token);
      api.setAuthToken(token);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al registrarse",
      });
      throw error;
    }
  },

  logout: async () => {
    await clearToken();
    api.setAuthToken(null);
    set({ user: null, error: null });
  },
}));
