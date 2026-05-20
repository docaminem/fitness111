import { useState } from 'react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { ContentType } from '../../types/xtream';
import type { FavoriteItem } from '../../types/player';

interface Props {
  id: string;
  streamId: number;
  name: string;
  poster: string;
  rating?: number;
  type: ContentType;
  categoryId?: string;
  progress?: number;
  duration?: number;
  containerExtension?: string;
  onClick: () => void;
}

export default function ContentCard({
  id, streamId, name, poster, rating, type, categoryId = '', progress = 0,
  duration = 0, containerExtension, onClick,
}: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const [imgError, setImgError] = useState(false);
  const fav = isFavorite(id);
  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fav) {
      removeFavorite(id);
    } else {
      const item: FavoriteItem = {
        id, type, name, poster, streamId, categoryId, addedAt: Date.now(),
        rating, containerExtension,
      };
      addFavorite(item);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-[#1a1a2e] hover:ring-2 hover:ring-violet-500/60 transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-[#1a1a2e]">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-900/40">
            <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-14 h-14 rounded-full bg-violet-600/90 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Live badge */}
        {type === 'live' && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 rounded text-white text-xs font-bold tracking-wider">
            LIVE
          </div>
        )}

        {/* Rating */}
        {rating && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-yellow-400 text-xs font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {typeof rating === 'number' ? rating.toFixed(1) : rating}
          </div>
        )}

        {/* Progress bar */}
        {pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <p className="text-white/90 text-xs font-medium leading-tight line-clamp-2">{name}</p>
          <button
            onClick={toggleFav}
            className={`flex-shrink-0 mt-0.5 transition-colors ${fav ? 'text-red-400' : 'text-white/30 hover:text-red-400'}`}
          >
            <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
