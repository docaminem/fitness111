import { useState } from 'react';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';
import { xtreamApi } from '../services/xtreamApi';
import ContentCard from '../components/Content/ContentCard';
import InfoModal from '../components/Content/InfoModal';
import type { FavoriteItem } from '../types/player';

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();
  const { openPlayer } = usePlayerStore();
  const [selected, setSelected] = useState<FavoriteItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series' | 'live'>('all');

  const filtered = filter === 'all' ? favorites : favorites.filter((f) => f.type === filter);

  const handleClick = (fav: FavoriteItem) => {
    if (fav.type === 'live') {
      const url = xtreamApi.getLiveStreamUrl(fav.streamId);
      openPlayer({ url, title: fav.name, poster: fav.poster, type: 'live', streamId: fav.streamId });
    } else {
      setSelected(fav);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mes favoris</h1>
          <p className="text-white/40 text-sm">{filtered.length} éléments</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'movie', 'series', 'live'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
          >
            {t === 'all' ? 'Tous' : t === 'movie' ? 'Films' : t === 'series' ? 'Séries' : 'TV Live'}
          </button>
        ))}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-24">
          <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-white/30 text-lg">Aucun favori</p>
          <p className="text-white/20 text-sm mt-1">Ajoutez des films, séries ou chaînes à vos favoris</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-lg">Aucun élément dans cette catégorie</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filtered.map((fav) => (
            <ContentCard
              key={fav.id}
              id={fav.id}
              streamId={fav.streamId}
              name={fav.name}
              poster={fav.poster}
              type={fav.type}
              categoryId={fav.categoryId}
              rating={fav.rating}
              containerExtension={fav.containerExtension}
              onClick={() => handleClick(fav)}
            />
          ))}
        </div>
      )}

      {selected && (
        <InfoModal
          type={selected.type as 'movie' | 'series'}
          streamId={selected.streamId}
          name={selected.name}
          poster={selected.poster}
          categoryId={selected.categoryId}
          containerExtension={selected.containerExtension}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
