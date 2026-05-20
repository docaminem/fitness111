import { create } from 'zustand';
import { storageService } from '../services/storageService';
import type { FavoriteItem } from '../types/player';

interface FavoritesState {
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  load: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: storageService.getFavorites(),

  isFavorite: (id) => get().favorites.some((f) => f.id === id),

  addFavorite: (item) => {
    storageService.addFavorite(item);
    set({ favorites: storageService.getFavorites() });
  },

  removeFavorite: (id) => {
    storageService.removeFavorite(id);
    set({ favorites: storageService.getFavorites() });
  },

  load: () => set({ favorites: storageService.getFavorites() }),
}));
