import type { ContentType } from './xtream';

export interface WatchHistoryItem {
  id: string;
  type: ContentType;
  name: string;
  poster: string;
  streamId: number;
  progress: number;
  duration: number;
  lastWatched: number;
  episodeId?: string;
  seasonNum?: number;
  episodeNum?: number;
  seriesId?: number;
  containerExtension?: string;
}

export interface FavoriteItem {
  id: string;
  type: ContentType;
  name: string;
  poster: string;
  streamId: number;
  categoryId: string;
  addedAt: number;
  rating?: number;
  containerExtension?: string;
  seriesId?: number;
}

export interface PlayerState {
  isOpen: boolean;
  url: string;
  title: string;
  poster: string;
  type: ContentType;
  streamId: number;
  episodeId?: string;
  startTime?: number;
  containerExtension?: string;
}
