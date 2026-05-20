import { useEffect, useState, useCallback } from 'react';
import { xtreamApi } from '../services/xtreamApi';
import type { Category, VODStream } from '../types/xtream';
import ContentCard from '../components/Content/ContentCard';
import InfoModal from '../components/Content/InfoModal';
import Spinner from '../components/UI/Spinner';

export default function MoviesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [streams, setStreams] = useState<VODStream[]>([]);
  const [filtered, setFiltered] = useState<VODStream[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<VODStream | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 60;

  // Load categories only on mount
  useEffect(() => {
    xtreamApi.getVODCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, []);

  // Load streams when category changes
  useEffect(() => {
    if (loadingCats) return;
    setLoadingStreams(true);
    setStreams([]);
    setFiltered([]);
    setPage(1);
    xtreamApi.getVODStreams(selectedCat || undefined)
      .then((data) => { setStreams(data); setFiltered(data); })
      .catch(console.error)
      .finally(() => setLoadingStreams(false));
  }, [selectedCat, loadingCats]);

  const applySearch = useCallback(() => {
    if (!search.trim()) { setFiltered(streams); return; }
    const q = search.toLowerCase();
    setFiltered(streams.filter((s) => s.name.toLowerCase().includes(q)));
    setPage(1);
  }, [streams, search]);

  useEffect(() => { applySearch(); }, [applySearch]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Films</h1>
          {!loadingStreams && (
            <p className="text-white/40 text-xs">{filtered.length} films</p>
          )}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="ml-auto bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors w-56"
        />
      </div>

      {/* Categories */}
      {loadingCats ? (
        <div className="h-8 flex items-center mb-5">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <button onClick={() => setSelectedCat('')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCat === '' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}>
            Tous
          </button>
          {categories.map((cat) => (
            <button key={cat.category_id} onClick={() => setSelectedCat(cat.category_id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.category_id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}>
              {cat.category_name}
            </button>
          ))}
        </div>
      )}

      {loadingStreams ? (
        <Spinner size="lg" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30">Aucun film trouvé</p>
        </div>
      ) : (
        <>
          {/* Netflix-style auto-fill grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {paginated.map((s) => (
              <ContentCard
                key={s.stream_id}
                id={String(s.stream_id)}
                streamId={s.stream_id}
                name={s.name}
                poster={s.stream_icon}
                rating={s.rating_5based ? s.rating_5based * 2 : undefined}
                type="movie"
                categoryId={s.category_id}
                containerExtension={s.container_extension}
                onClick={() => setSelectedMovie(s)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <button onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all text-sm">
                Voir plus ({filtered.length - paginated.length} restants)
              </button>
            </div>
          )}
        </>
      )}

      {selectedMovie && (
        <InfoModal
          type="movie"
          streamId={selectedMovie.stream_id}
          name={selectedMovie.name}
          poster={selectedMovie.stream_icon}
          categoryId={selectedMovie.category_id}
          containerExtension={selectedMovie.container_extension}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
