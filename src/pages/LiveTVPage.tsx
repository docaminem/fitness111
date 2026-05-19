import { useEffect, useState, useCallback } from 'react';
import { xtreamApi } from '../services/xtreamApi';
import type { Category, LiveStream } from '../types/xtream';
import { usePlayerStore } from '../store/playerStore';
import LiveChannelCard from '../components/Content/LiveChannelCard';
import Spinner from '../components/UI/Spinner';

export default function LiveTVPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [filtered, setFiltered] = useState<LiveStream[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { openPlayer } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats, live] = await Promise.all([
          xtreamApi.getLiveCategories(),
          xtreamApi.getLiveStreams(),
        ]);
        setCategories(cats);
        setStreams(live);
        setFiltered(live);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
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

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">TV en direct</h1>
          <p className="text-white/40 text-sm">{filtered.length} chaînes disponibles</p>
        </div>
        <div className="flex-1 flex items-center gap-3 ml-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une chaîne..."
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
