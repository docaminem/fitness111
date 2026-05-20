import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Playlist } from '../types/app';

interface AppStore {
  user: User | null;
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  loading: boolean;
  error: string | null;

  // Auth
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<boolean>;

  // Playlists
  loadPlaylists: () => Promise<void>;
  addPlaylist: (p: Pick<Playlist, 'name' | 'host' | 'port' | 'username' | 'password'>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  setActivePlaylist: (p: Playlist) => void;
  clearActivePlaylist: () => void;
  clearError: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  playlists: [],
  activePlaylist: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ user: data.user, loading: false });
    await get().loadPlaylists();
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ user: data.user, loading: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, playlists: [], activePlaylist: null });
  },

  restoreSession: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return false;
    set({ user: data.session.user });
    await get().loadPlaylists();
    return true;
  },

  loadPlaylists: async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) { console.error('loadPlaylists:', error); return; }
    set({ playlists: data ?? [] });
  },

  addPlaylist: async (p) => {
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase
      .from('playlists')
      .insert({ ...p, user_id: user.id })
      .select()
      .single();
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ playlists: [...s.playlists, data] }));
  },

  deletePlaylist: async (id) => {
    await supabase.from('playlists').delete().eq('id', id);
    set((s) => ({
      playlists: s.playlists.filter((p) => p.id !== id),
      activePlaylist: s.activePlaylist?.id === id ? null : s.activePlaylist,
    }));
  },

  setActivePlaylist: (p) => set({ activePlaylist: p }),
  clearActivePlaylist: () => set({ activePlaylist: null }),
}));
