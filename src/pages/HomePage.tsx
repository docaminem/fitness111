import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';
import { xtreamApi } from '../services/xtreamApi';
import type { WatchHistoryItem, FavoriteItem } from '../types/player';
import ContentCard from '../components/Content/ContentCard';

export default function HomePage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const { favorites } = useFavoritesStore();
  const { openPlayer } = usePlayerStore();

  useEffect(() => {
    setHistory(storageService.getHistory().slice(0, 12));
  }, []);

  const continueWatching = history.filter((h) => h.type !== 'live' && h.progress > 30);

  const resumeItem = (item: WatchHistoryItem) => {
    let url: string;
    if (item.type === 'movie') {
      url = xtreamApi.getVODStreamUrl(item.streamId, item.containerExtension ?? 'mkv');
    } else {
      url = xtreamApi.getSeriesEpisodeUrl(item.episodeId!, item.containerExtension ?? 'mkv');
    }
    openPlayer({
      url,
      title: item.name,
      poster: item.poster,
      type: item.type,
      streamId: item.streamId,
      episodeId: item.episodeId,
      startTime: item.progress,
      containerExtension: item.containerExtension,
    });
  };

  const playFav = (fav: FavoriteItem) => {
    if (fav.type === 'live') {
      const url = xtreamApi.getLiveStreamUrl(fav.streamId);
      openPlayer({ url, title: fav.name, poster: fav.poster, type: 'live', streamId: fav.streamId });
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Hero / welcome */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-white/10 p-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-400 via-transparent to-transparent pointer-events-none" />
        <h2 className="text-2xl font-bold text-white mb-2">Bienvenue sur IPTV Player</h2>
        <p className="text-white/60 mb-6">Votre bibliothèque de films, séries et chaînes en direct.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/movies" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors">
            Découvrir des films
          </Link>
          <Link to="/live" className="px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-white font-medium transition-colors border border-white/10">
            TV en direct
          </Link>
        </div>
      </div>

      {/* Continue watching */}
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Continuer à regarder</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {continueWatching.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                streamId={item.streamId}
                name={item.name}
                poster={item.poster}
                type={item.type}
                progress={item.progress}
                duration={item.duration}
                containerExtension={item.containerExtension}
                onClick={() => resumeItem(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Mes favoris</h3>
            <Link to="/favorites" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
              Voir tout
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.slice(0, 6).map((fav) => (
              <ContentCard
                key={fav.id}
                id={fav.id}
                streamId={fav.streamId}
                name={fav.name}
                poster={fav.poster}
                type={fav.type}
                categoryId={fav.categoryId}
                containerExtension={fav.containerExtension}
                onClick={() => playFav(fav)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section>
        <h3 className="text-white font-semibold text-lg mb-4">Navigation rapide</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/live', label: 'TV en direct', icon: '📺', desc: 'Chaînes live avec EPG', color: 'from-red-900/40 to-red-800/20' },
            { to: '/movies', label: 'Films', icon: '🎬', desc: 'Bibliothèque VOD', color: 'from-blue-900/40 to-blue-800/20' },
            { to: '/series', label: 'Séries', icon: '📺', desc: 'Toutes les séries', color: 'from-green-900/40 to-green-800/20' },
            { to: '/favorites', label: 'Favoris', icon: '❤️', desc: 'Votre sélection', color: 'from-pink-900/40 to-pink-800/20' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`p-5 rounded-xl bg-gradient-to-br ${item.color} border border-white/5 hover:border-white/10 transition-all hover:scale-[1.02] group`}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="text-white font-semibold">{item.label}</h4>
              <p className="text-white/40 text-sm mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
