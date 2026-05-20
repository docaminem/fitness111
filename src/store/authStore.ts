import { create } from 'zustand';
import { xtreamApi } from '../services/xtreamApi';
import { storageService } from '../services/storageService';
import { useContentStore } from './contentStore';
import type { XtreamCredentials, XtreamUserInfo, XtreamServerInfo } from '../types/xtream';

interface AuthState {
  isAuthenticated: boolean;
  credentials: XtreamCredentials | null;
  userInfo: XtreamUserInfo | null;
  serverInfo: XtreamServerInfo | null;
  loading: boolean;
  error: string | null;
  login: (creds: XtreamCredentials) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  credentials: null,
  userInfo: null,
  serverInfo: null,
  loading: false,
  error: null,

  login: async (creds) => {
    set({ loading: true, error: null });
    try {
      xtreamApi.setCredentials(creds);
      const auth = await xtreamApi.authenticate();
      if (!auth.user_info || auth.user_info.auth === 0) {
        throw new Error('Invalid credentials');
      }
      storageService.saveCredentials(creds);
      set({
        isAuthenticated: true,
        credentials: creds,
        userInfo: auth.user_info,
        serverInfo: auth.server_info,
        loading: false,
        error: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Connection failed';
      set({ loading: false, error: msg, isAuthenticated: false });
    }
  },

  logout: () => {
    storageService.clearCredentials();
    useContentStore.getState().clearAll();
    set({ isAuthenticated: false, credentials: null, userInfo: null, serverInfo: null });
  },

  restoreSession: async () => {
    const creds = storageService.getCredentials();
    if (!creds) return false;
    try {
      xtreamApi.setCredentials(creds);
      const auth = await xtreamApi.authenticate();
      if (!auth.user_info || auth.user_info.auth === 0) return false;
      set({
        isAuthenticated: true,
        credentials: creds,
        userInfo: auth.user_info,
        serverInfo: auth.server_info,
      });
      return true;
    } catch {
      return false;
    }
  },
}));
