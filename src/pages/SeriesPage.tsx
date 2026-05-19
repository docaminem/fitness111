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
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Series | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 48;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats, srs] = await Promise.all([
          xtreamApi.getSeriesCategories(),
          xtreamApi.getSeries(),
        ]);
        setCategories(cats);
        setSeries(srs);
        setFiltered(srs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const applyFilters = useCallback(() => {
    let result = series;
    if (selectedCat) result = result.filter((s) => s.category_id === selectedCat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    setFiltered(result);
    setPage(1);
  }, [series, selectedCat, search]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Séries</h1>
          <p className="text-white/40 text-sm">{filtered.length} séries disponibles</p>
        </div>
        <div className="flex-1 flex items-center gap-3 ml-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une série..."
            className="flex-1 max-w-xs bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCat('')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCat === '' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCat(cat.category_id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCat === cat.category_id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Spinner size="lg" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-lg">Aucune série trouvée</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
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
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all"
              >
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
