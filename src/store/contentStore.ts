import { create } from 'zustand';
import type { Category, VODStream, Series, LiveStream } from '../types/xtream';

interface ContentStore {
  vodCategories: Category[] | null;
  vodStreams: Record<string, VODStream[]>;
  seriesCategories: Category[] | null;
  seriesData: Record<string, Series[]>;
  liveCategories: Category[] | null;
  liveStreams: LiveStream[] | null;

  setVodCategories: (cats: Category[]) => void;
  setVodStreams: (catKey: string, streams: VODStream[]) => void;
  setSeriesCategories: (cats: Category[]) => void;
  setSeriesData: (catKey: string, data: Series[]) => void;
  setLiveCategories: (cats: Category[]) => void;
  setLiveStreams: (streams: LiveStream[]) => void;
  clearAll: () => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  vodCategories: null,
  vodStreams: {},
  seriesCategories: null,
  seriesData: {},
  liveCategories: null,
  liveStreams: null,

  setVodCategories: (cats) => set({ vodCategories: cats }),
  setVodStreams: (catKey, streams) =>
    set((s) => ({ vodStreams: { ...s.vodStreams, [catKey]: streams } })),
  setSeriesCategories: (cats) => set({ seriesCategories: cats }),
  setSeriesData: (catKey, data) =>
    set((s) => ({ seriesData: { ...s.seriesData, [catKey]: data } })),
  setLiveCategories: (cats) => set({ liveCategories: cats }),
  setLiveStreams: (streams) => set({ liveStreams: streams }),
  clearAll: () =>
    set({
      vodCategories: null,
      vodStreams: {},
      seriesCategories: null,
      seriesData: {},
      liveCategories: null,
      liveStreams: null,
    }),
}));
