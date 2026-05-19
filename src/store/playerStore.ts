import { create } from 'zustand';
import { storageService } from '../services/storageService';
import type { PlayerState } from '../types/player';
import type { ContentType } from '../types/xtream';

interface PlayerStoreState {
  player: PlayerState | null;
  isPiP: boolean;
  openPlayer: (opts: {
    url: string;
    title: string;
    poster: string;
    type: ContentType;
    streamId: number;
    episodeId?: string;
    startTime?: number;
    containerExtension?: string;
  }) => void;
  closePlayer: () => void;
  setIsPiP: (v: boolean) => void;
  updateProgress: (streamId: number, progress: number, duration: number, episodeId?: string) => void;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  player: null,
  isPiP: false,

  openPlayer: (opts) => {
    const history = storageService.getHistory();
    const id = opts.episodeId ?? String(opts.streamId);
    const existing = history.find((h) => h.id === id);
    set({
      player: {
        isOpen: true,
        url: opts.url,
        title: opts.title,
        poster: opts.poster,
        type: opts.type,
        streamId: opts.streamId,
        episodeId: opts.episodeId,
        startTime: opts.startTime ?? existing?.progress ?? 0,
        containerExtension: opts.containerExtension,
      },
    });
  },

  closePlayer: () => {
    const { player } = get();
    if (player) {
      set({ player: null, isPiP: false });
    }
  },

  setIsPiP: (v) => set({ isPiP: v }),

  updateProgress: (streamId, progress, duration, episodeId) => {
    const { player } = get();
    if (!player) return;
    const id = episodeId ?? String(streamId);
    const existing = storageService.getHistory().find((h) => h.id === id);
    storageService.updateHistory({
      id,
      type: player.type,
      name: player.title,
      poster: player.poster,
      streamId,
      progress,
      duration,
      lastWatched: Date.now(),
      episodeId,
      containerExtension: player.containerExtension,
    });
    if (existing) {
      // already saved
    }
  },
}));
