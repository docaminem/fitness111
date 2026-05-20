import { useEffect, useState, useCallback } from 'react';
import { xtreamApi } from '../services/xtreamApi';
import { useContentStore } from '../store/contentStore';
import type { Category, LiveStream } from '../types/xtream';
import { usePlayerStore } from '../store/playerStore';
import LiveChannelCard from '../components/Content/LiveChannelCard';
import Spinner from '../components/UI/Spinner';

export default function LiveTVPage() {
  const {
    liveCategories: cachedCats,
    liveStreams: cachedStreams,
    setLiveCategories,
    setLiveStreams,
  } = useContentStore();

  const [categories, setCategories] = useState<Category[]>(cachedCats ?? []);
  const [streams, setStreams] = useState<LiveStream[]>(cachedStreams ?? []);
  const [filtered, setFiltered] = useState<LiveStream[]>(cachedStreams ?? []);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(cachedStreams === null);
  const { openPlayer } = usePlayerStore();

  useEffect(() => {
    if (cachedStreams !== null && cachedCats !== null) return;
    setLoading(true);
    const load = async () => {
      try {
        const [cats, live] = await Promise.all([
          xtreamApi.getLiveCategories(),
          xtreamApi.getLiveStreams(),
        ]);
        setCategories(cats);
        setStreams(live);
        setFiltered(live);
        setLiveCategories(cats);
        setLiveStreams(live);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = useCallback(() => {
    let result = streams;
    if (selectedCat) result = result.filter((s) => s.category_id === selectedCat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [streams, selectedCat, search]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const play = (stream: LiveStream) => {
    const url = xtreamApi.getLiveStreamUrl(stream.stream_id);
    openPlayer({
      url,
      title: stream.name,
      poster: stream.stream_icon,
      type: 'live',
      streamId: stream.stream_id,
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">TV en direct</h1>
          <p className="text-white/40 text-xs">{filtered.length} chaînes</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une chaîne..."
          className="ml-auto bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors w-48 md:w-64"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCat === '' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}>
            Toutes
          </button>
          {categories.map((cat) => (
            <button key={cat.category_id} onClick={() => setSelectedCat(cat.category_id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCat === cat.category_id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}>
              {cat.category_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Spinner size="lg" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-lg">Aucune chaîne trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((s) => (
            <LiveChannelCard key={s.stream_id} stream={s} onClick={() => play(s)} />
          ))}
        </div>
      )}
    </div>
  );
}
