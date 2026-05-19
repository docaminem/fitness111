import { useState } from 'react';
import { useFavoritesStore } from '../../store/favoritesStore';
import EPGBar from '../EPG/EPGBar';
import type { LiveStream } from '../../types/xtream';

interface Props {
  stream: LiveStream;
  onClick: () => void;
}

export default function LiveChannelCard({ stream, onClick }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const [imgError, setImgError] = useState(false);
  const fav = isFavorite(String(stream.stream_id));

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fav) {
      removeFavorite(String(stream.stream_id));
    } else {
      addFavorite({
        id: String(stream.stream_id),
        type: 'live',
        name: stream.name,
        poster: stream.stream_icon,
        streamId: stream.stream_id,
        categoryId: stream.category_id,
        addedAt: Date.now(),
      });
    }
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl bg-[#1a1a2e] hover:ring-2 hover:ring-violet-500/60 hover:bg-[#1e1e35] transition-all duration-200 overflow-hidden"
    >
      <div className="p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-[#12121f] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {stream.stream_icon && !imgError ? (
            <img
              src={stream.stream_icon}
              alt={stream.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.869v6.262a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/90 text-sm font-medium truncate">{stream.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-medium">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFav}
            className={`transition-colors ${fav ? 'text-red-400' : 'text-white/20 hover:text-red-400'}`}
          >
            <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      {stream.epg_channel_id && <EPGBar streamId={stream.stream_id} />}
    </div>
  );
}
