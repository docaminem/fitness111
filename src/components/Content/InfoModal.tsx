import { useEffect, useState } from 'react';
import { xtreamApi } from '../../services/xtreamApi';
import { usePlayerStore } from '../../store/playerStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { storageService } from '../../services/storageService';
import type { VODInfo, SeriesInfo, Episode } from '../../types/xtream';
import Spinner from '../UI/Spinner';

interface Props {
  type: 'movie' | 'series';
  streamId: number;
  name: string;
  poster: string;
  categoryId: string;
  containerExtension?: string;
  onClose: () => void;
}

export default function InfoModal({ type, streamId, name, poster, categoryId, containerExtension, onClose }: Props) {
  const [vodInfo, setVodInfo] = useState<VODInfo | null>(null);
  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('1');
  const [loading, setLoading] = useState(true);
  const { openPlayer } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const fav = isFavorite(String(streamId));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (type === 'movie') {
          const info = await xtreamApi.getVODInfo(streamId);
          setVodInfo(info);
        } else {
          const info = await xtreamApi.getSeriesInfo(streamId);
          setSeriesInfo(info);
          const seasons = Object.keys(info.episodes || {});
          if (seasons.length > 0) setSelectedSeason(seasons[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, streamId]);

  const playMovie = () => {
    const ext = vodInfo?.movie_data?.container_extension ?? containerExtension ?? 'mkv';
    const url = xtreamApi.getVODStreamUrl(streamId, ext);
    const history = storageService.getHistory();
    const saved = history.find((h) => h.id === String(streamId));
    openPlayer({
      url,
      title: name,
      poster: vodInfo?.info?.movie_image ?? poster,
      type: 'movie',
      streamId,
      startTime: saved?.progress ?? 0,
      containerExtension: ext,
    });
    onClose();
  };

  const playEpisode = (ep: Episode) => {
    const ext = ep.container_extension ?? 'mkv';
    const url = xtreamApi.getSeriesEpisodeUrl(ep.id, ext);
    const history = storageService.getHistory();
    const saved = history.find((h) => h.id === ep.id);
    openPlayer({
      url,
      title: `${name} - S${ep.season}E${ep.episode_num} ${ep.title}`,
      poster: ep.info?.movie_image ?? poster,
      type: 'series',
      streamId,
      episodeId: ep.id,
      startTime: saved?.progress ?? 0,
      containerExtension: ext,
    });
    onClose();
  };

  const toggleFav = () => {
    if (fav) {
      removeFavorite(String(streamId));
    } else {
      addFavorite({
        id: String(streamId),
        type,
        name,
        poster,
        streamId,
        categoryId,
        addedAt: Date.now(),
        containerExtension,
      });
    }
  };

  // Use loose typing to handle union of movie info and series info shapes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const info = (type === 'movie' ? vodInfo?.info : seriesInfo?.info) as Record<string, any> | undefined;
  const backdropImage: string | undefined = info?.backdrop_path?.[0] ?? info?.cover_big ?? info?.movie_image ?? poster;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-3xl max-h-[90vh] bg-[#0d0d1a] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col border border-white/10">
        {/* Backdrop */}
        <div className="relative h-56 flex-shrink-0 overflow-hidden">
          {backdropImage && (
            <img src={backdropImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <img
              src={poster}
              alt={name}
              className="w-20 h-28 object-cover rounded-lg shadow-2xl flex-shrink-0 border border-white/10"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-xl font-bold leading-tight">{name}</h2>
              {info && (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {info.genre && <span className="text-white/50 text-xs">{info.genre.split(',')[0]}</span>}
                  {(info.releaseDate || info.releasedate) && (
                    <span className="text-white/50 text-xs">
                      {(info.releaseDate || info.releasedate)?.substring(0, 4)}
                    </span>
                  )}
                  {(info.rating || info.rating_5based) && (
                    <span className="flex items-center gap-1 text-yellow-400 text-xs">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {info.rating || (Number(info.rating_5based) * 2).toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* Actions */}
              <div className="flex gap-3">
                {type === 'movie' && (
                  <button
                    onClick={playMovie}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Lire
                  </button>
                )}
                <button
                  onClick={toggleFav}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors border ${
                    fav
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {fav ? 'Retirerr' : 'Favoris'}
                </button>
              </div>

              {/* Plot */}
              {(info?.plot || info?.description) && (
                <div>
                  <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Synopsis</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{info.plot || info.description}</p>
                </div>
              )}

              {/* Cast / Director */}
              <div className="grid grid-cols-2 gap-4">
                {info?.director && (
                  <div>
                    <h3 className="text-white/40 text-xs uppercase tracking-wider mb-1">Réalisateur</h3>
                    <p className="text-white/70 text-sm">{info.director}</p>
                  </div>
                )}
                {(info?.cast || info?.actors) && (
                  <div>
                    <h3 className="text-white/40 text-xs uppercase tracking-wider mb-1">Acteurs</h3>
                    <p className="text-white/70 text-sm line-clamp-3">{info.cast || info.actors}</p>
                  </div>
                )}
              </div>

              {/* Series episodes */}
              {type === 'series' && seriesInfo && (
                <div>
                  {/* Season selector */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                    {Object.keys(seriesInfo.episodes || {}).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSeason(s)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedSeason === s
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Saison {s}
                      </button>
                    ))}
                  </div>

                  {/* Episode list */}
                  <div className="space-y-2">
                    {(seriesInfo.episodes[selectedSeason] || []).map((ep) => {
                      const history = storageService.getHistory();
                      const saved = history.find((h) => h.id === ep.id);
                      const pct = saved && saved.duration > 0
                        ? Math.min(100, (saved.progress / saved.duration) * 100)
                        : 0;
                      return (
                        <button
                          key={ep.id}
                          onClick={() => playEpisode(ep)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left group"
                        >
                          <div className="relative w-24 h-14 rounded overflow-hidden bg-white/5 flex-shrink-0">
                            {ep.info?.movie_image ? (
                              <img src={ep.info.movie_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            {pct > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                                <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                              <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/90 text-sm font-medium truncate">
                              {ep.episode_num}. {ep.title || `Épisode ${ep.episode_num}`}
                            </p>
                            {ep.info?.plot && (
                              <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{ep.info.plot}</p>
                            )}
                            {ep.info?.duration && (
                              <p className="text-white/30 text-xs mt-0.5">{ep.info.duration}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
