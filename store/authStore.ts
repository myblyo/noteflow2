import { Platform } from "react-native";
import auth from "@react-native-firebase/auth";
import { create } from "zustand";
import * as api from "../lib/api";
import {
  firebaseAuthErrorMessage,
  loginWithEmail,
  logoutFirebase,
  registerWithProfile,
  type UserProfile,
} from "../lib/firebaseAuth";
import { clearToken, getToken, setToken } from "../lib/token";

export type AuthUser = UserProfile;

interface AuthStore {
  user: AuthUser | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  initWeb: () => Promise<void>;
  initNative: () => Promise<void>;
  setSession: (user: UserProfile | null) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const WEB_USER_KEY = "noteflow_auth_user";

function persistWebUser(user: UserProfile | null) {
  if (Platform.OS !== "web") return;
  if (!user) {
    globalThis.sessionStorage?.removeItem(WEB_USER_KEY);
    return;
  }
  globalThis.sessionStorage?.setItem(WEB_USER_KEY, JSON.stringify(user));
}

function loadWebUser(): UserProfile | null {
  if (Platform.OS !== "web") return null;
  const raw = globalThis.sessionStorage?.getItem(WEB_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function mapApiUser(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}): UserProfile {
  return { ...user, avatarUrl: user.avatarUrl ?? null };
}
async function persistSession(user: UserProfile | null) {
  if (!user) {
    await clearToken();
    api.setAuthToken(null);
    persistWebUser(null);
    return;
  }

  if (Platform.OS === "web") {
    persistWebUser(user);
    return;
  }

  const token = await auth().currentUser?.getIdToken();
  if (token) {
    await setToken(token);
    api.setAuthToken(token);
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isReady: false,
  isLoading: false,
  error: null,

  initWeb: async () => {
    const token = await getToken();
    api.setAuthToken(token);
    if (!token) {
      set({ user: null, isReady: true });
      return;
    }
    try {
      const user = mapApiUser(await api.getMe());
      persistWebUser(user);
      set({ user, isReady: true });
    } catch {
      const user = loadWebUser();
      set({ user, isReady: true });
    }
  },

  initNative: async () => {
    const token = await getToken();
    if (token) {
      api.setAuthToken(token);
    }
  },

  setSession: async (user) => {
    await persistSession(user);
    set({ user, isReady: true });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (Platform.OS === "web") {
        const { token, user } = await api.login(email, password);
        const profile = mapApiUser(user);
        await setToken(token);
        api.setAuthToken(token);
        persistWebUser(profile);
        set({ user: profile, isLoading: false });
        return;
      }

      const user = await loginWithEmail(email, password);
      await persistSession(user);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          Platform.OS === "web"
            ? error instanceof Error
              ? error.message
              : "Error al iniciar sesión"
            : firebaseAuthErrorMessage(error),
      });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (Platform.OS === "web") {
        const { token, user } = await api.register(name, email, password);
        const profile = mapApiUser(user);
        await setToken(token);
        api.setAuthToken(token);
        persistWebUser(profile);
        set({ user: profile, isLoading: false });
        return;
      }

      const user = await registerWithProfile(email, password, name);
      await persistSession(user);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          Platform.OS === "web"
            ? error instanceof Error
              ? error.message
              : "Error al registrarse"
            : firebaseAuthErrorMessage(error),
      });
      throw error;
    }
  },

  logout: async () => {
    if (Platform.OS !== "web") {
      await logoutFirebase();
    }
    await clearToken();
    api.setAuthToken(null);
    persistWebUser(null);
    set({ user: null, error: null });
  },
}));
