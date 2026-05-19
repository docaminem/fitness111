import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { xtreamApi } from '../services/xtreamApi';
import { usePlayerStore } from '../store/playerStore';
import type { LiveStream, VODStream, Series } from '../types/xtream';
import ContentCard from '../components/Content/ContentCard';
import InfoModal from '../components/Content/InfoModal';
import Spinner from '../components/UI/Spinner';

type SearchResult =
  | { kind: 'live'; data: LiveStream }
  | { kind: 'movie'; data: VODStream }
  | { kind: 'series'; data: Series };

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<VODStream | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const { openPlayer } = usePlayerStore();

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const lower = q.toLowerCase();
      const [live, vods, series] = await Promise.all([
        xtreamApi.getLiveStreams().catch(() => [] as LiveStream[]),
        xtreamApi.getVODStreams().catch(() => [] as VODStream[]),
        xtreamApi.getSeries().catch(() => [] as Series[]),
      ]);
      const res: SearchResult[] = [
        ...live.filter((s) => s.name.toLowerCase().includes(lower)).slice(0, 20).map((d) => ({ kind: 'live' as const, data: d })),
        ...vods.filter((s) => s.name.toLowerCase().includes(lower)).slice(0, 40).map((d) => ({ kind: 'movie' as const, data: d })),
        ...series.filter((s) => s.name.toLowerCase().includes(lower)).slice(0, 40).map((d) => ({ kind: 'series' as const, data: d })),
      ];
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = params.get('q') ?? '';
    setQuery(q);
    doSearch(q);
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: query });
  };

  const handleClick = (r: SearchResult) => {
    if (r.kind === 'live') {
      const url = xtreamApi.getLiveStreamUrl(r.data.stream_id);
      openPlayer({ url, title: r.data.name, poster: r.data.stream_icon, type: 'live', streamId: r.data.stream_id });
    } else if (r.kind === 'movie') {
      setSelectedMovie(r.data as VODStream);
    } else {
      setSelectedSeries(r.data as Series);
    }
  };

  const getCardProps = (r: SearchResult) => {
    if (r.kind === 'live') return { id: String(r.data.stream_id), streamId: r.data.stream_id, name: r.data.name, poster: r.data.stream_icon, type: 'live' as const, categoryId: r.data.category_id };
    if (r.kind === 'movie') return { id: String(r.data.stream_id), streamId: r.data.stream_id, name: r.data.name, poster: r.data.stream_icon, type: 'movie' as const, categoryId: r.data.category_id, rating: r.data.rating_5based * 2, containerExtension: r.data.container_extension };
    const s = r.data as Series;
    return { id: String(s.series_id), streamId: s.series_id, name: s.name, poster: s.cover, type: 'series' as const, categoryId: s.category_id, rating: s.rating_5based * 2 };
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="relative mb-8 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Films, séries, chaînes..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 pl-12 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
          autoFocus
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </form>

      {loading ? (
        <Spinner size="lg" />
      ) : results.length === 0 && params.get('q') ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-lg">Aucun résultat pour "{params.get('q')}"</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-white/40 text-sm mb-4">{results.length} résultats pour "{params.get('q')}"</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {results.map((r) => {
              const props = getCardProps(r);
              return <ContentCard key={`${r.kind}-${props.id}`} {...props} onClick={() => handleClick(r)} />;
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-white/30 text-lg">Recherchez dans toute votre bibliothèque</p>
        </div>
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
      {selectedSeries && (
        <InfoModal
          type="series"
          streamId={selectedSeries.series_id}
          name={selectedSeries.name}
          poster={selectedSeries.cover}
          categoryId={selectedSeries.category_id}
          onClose={() => setSelectedSeries(null)}
        />
      )}
    </div>
  );
}
