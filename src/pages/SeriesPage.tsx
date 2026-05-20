import { useEffect, useState, useCallback } from 'react';
import { xtreamApi } from '../services/xtreamApi';
import type { Category, Series } from '../types/xtream';
import ContentCard from '../components/Content/ContentCard';
import InfoModal from '../components/Content/InfoModal';
import Spinner from '../components/UI/Spinner';

export default function SeriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [filtered, setFiltered] = useState<Series[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [selected, setSelected] = useState<Series | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 60;

  useEffect(() => {
    xtreamApi.getSeriesCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    if (loadingCats) return;
    setLoadingStreams(true);
    setSeries([]);
    setFiltered([]);
    setPage(1);
    xtreamApi.getSeries(selectedCat || undefined)
      .then((data) => { setSeries(data); setFiltered(data); })
      .catch(console.error)
      .finally(() => setLoadingStreams(false));
  }, [selectedCat, loadingCats]);

  const applySearch = useCallback(() => {
    if (!search.trim()) { setFiltered(series); return; }
    const q = search.toLowerCase();
    setFiltered(series.filter((s) => s.name.toLowerCase().includes(q)));
    setPage(1);
  }, [series, search]);

  useEffect(() => { applySearch(); }, [applySearch]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Séries</h1>
          {!loadingStreams && (
            <p className="text-white/40 text-xs">{filtered.length} séries</p>
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

      {loadingCats ? (
        <div className="h-8 flex items-center mb-5">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <button onClick={() => setSelectedCat('')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCat === '' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}>
            Toutes
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
          <p className="text-white/30">Aucune série trouvée</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {paginated.map((s) => (
              <ContentCard
                key={s.series_id}
                id={String(s.series_id)}
                streamId={s.series_id}
                name={s.name}
                poster={s.cover}
                rating={s.rating_5based ? s.rating_5based * 2 : undefined}
                type="series"
                categoryId={s.category_id}
                onClick={() => setSelected(s)}
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

      {selected && (
        <InfoModal
          type="series"
          streamId={selected.series_id}
          name={selected.name}
          poster={selected.cover}
          categoryId={selected.category_id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
