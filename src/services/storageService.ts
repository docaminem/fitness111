import type { WatchHistoryItem, FavoriteItem } from '../types/player';
import type { XtreamCredentials } from '../types/xtream';

const KEYS = {
  CREDENTIALS: 'iptv_credentials',
  HISTORY: 'iptv_history',
  FAVORITES: 'iptv_favorites',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storageService = {
  getCredentials: (): XtreamCredentials | null => load<XtreamCredentials | null>(KEYS.CREDENTIALS, null),
  saveCredentials: (creds: XtreamCredentials) => save(KEYS.CREDENTIALS, creds),
  clearCredentials: () => localStorage.removeItem(KEYS.CREDENTIALS),

  getHistory: (): WatchHistoryItem[] => load<WatchHistoryItem[]>(KEYS.HISTORY, []),
  updateHistory: (item: WatchHistoryItem) => {
    const history = load<WatchHistoryItem[]>(KEYS.HISTORY, []);
    const filtered = history.filter((h) => h.id !== item.id);
    save(KEYS.HISTORY, [item, ...filtered].slice(0, 100));
  },
  removeFromHistory: (id: string) => {
    const history = load<WatchHistoryItem[]>(KEYS.HISTORY, []);
    save(KEYS.HISTORY, history.filter((h) => h.id !== id));
  },
  clearHistory: () => save(KEYS.HISTORY, []),

  getFavorites: (): FavoriteItem[] => load<FavoriteItem[]>(KEYS.FAVORITES, []),
  addFavorite: (item: FavoriteItem) => {
    const favs = load<FavoriteItem[]>(KEYS.FAVORITES, []);
    if (!favs.find((f) => f.id === item.id)) {
      save(KEYS.FAVORITES, [item, ...favs]);
    }
  },
  removeFavorite: (id: string) => {
    const favs = load<FavoriteItem[]>(KEYS.FAVORITES, []);
    save(KEYS.FAVORITES, favs.filter((f) => f.id !== id));
  },
  isFavorite: (id: string): boolean => {
    const favs = load<FavoriteItem[]>(KEYS.FAVORITES, []);
    return favs.some((f) => f.id === id);
  },
};
