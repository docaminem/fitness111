import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { Playlist } from '../types/app';

interface AppStore {
  user: User | null;
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  loading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<boolean>;

  loadPlaylists: () => Promise<void>;
  addPlaylist: (p: Pick<Playlist, 'name' | 'host' | 'port' | 'username' | 'password'>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  setActivePlaylist: (p: Playlist) => void;
  clearActivePlaylist: () => void;
  clearError: () => void;
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'Cet email est déjà utilisé.';
    case 'auth/invalid-email': return 'Email invalide.';
    case 'auth/weak-password': return 'Mot de passe trop faible (6 caractères minimum).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests': return 'Trop de tentatives. Réessayez plus tard.';
    case 'auth/network-request-failed': return 'Erreur réseau. Vérifiez votre connexion.';
    default: return code;
  }
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
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      set({ user: result.user, loading: false });
      await get().loadPlaylists();
    } catch (e) {
      const code = (e as { code?: string }).code ?? 'unknown';
      set({ loading: false, error: friendlyError(code) });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: result.user, loading: false });
    } catch (e) {
      const code = (e as { code?: string }).code ?? 'unknown';
      set({ loading: false, error: friendlyError(code) });
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, playlists: [], activePlaylist: null });
  },

  restoreSession: async () => {
    return new Promise<boolean>((resolve) => {
      const unsub = onAuthStateChanged(auth, async (u) => {
        unsub();
        if (!u) { resolve(false); return; }
        set({ user: u });
        await get().loadPlaylists();
        resolve(true);
      });
    });
  },

  loadPlaylists: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const q = query(
        collection(db, 'playlists'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'asc')
      );
      const snap = await getDocs(q);
      const items: Playlist[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          user_id: String(data.user_id ?? ''),
          name: String(data.name ?? 'Playlist'),
          host: String(data.host ?? ''),
          port: String(data.port ?? ''),
          username: String(data.username ?? ''),
          password: String(data.password ?? ''),
          created_at: data.created_at?.toString() ?? '',
        };
      });
      set({ playlists: items });
    } catch (e) {
      console.error('loadPlaylists:', e);
    }
  },

  addPlaylist: async (p) => {
    const { user } = get();
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'playlists'), {
        ...p,
        user_id: user.uid,
        created_at: serverTimestamp(),
      });
      const newPlaylist: Playlist = {
        id: docRef.id,
        user_id: user.uid,
        name: p.name,
        host: p.host,
        port: p.port,
        username: p.username,
        password: p.password,
        created_at: new Date().toISOString(),
      };
      set((s) => ({ playlists: [...s.playlists, newPlaylist] }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  deletePlaylist: async (id) => {
    try {
      await deleteDoc(doc(db, 'playlists', id));
      set((s) => ({
        playlists: s.playlists.filter((p) => p.id !== id),
        activePlaylist: s.activePlaylist?.id === id ? null : s.activePlaylist,
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  setActivePlaylist: (p) => set({ activePlaylist: p }),
  clearActivePlaylist: () => set({ activePlaylist: null }),
}));
