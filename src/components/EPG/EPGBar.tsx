import { useEffect, useState } from 'react';
import { xtreamApi } from '../../services/xtreamApi';
import type { EPGItem } from '../../types/xtream';

interface Props {
  streamId: number;
}

function getNow(): number {
  return Math.floor(Date.now() / 1000);
}

export default function EPGBar({ streamId }: Props) {
  const [epg, setEpg] = useState<EPGItem[]>([]);

  useEffect(() => {
    xtreamApi.getEPG(streamId, 3).then((r) => setEpg(r.epg_listings || [])).catch(() => {});
  }, [streamId]);

  if (epg.length === 0) return null;

  const now = getNow();
  const current = epg.find((e) => e.start_timestamp <= now && e.stop_timestamp > now);
  const next = epg.find((e) => e.start_timestamp > now);

  if (!current) return null;

  const progress =
    ((now - current.start_timestamp) / (current.stop_timestamp - current.start_timestamp)) * 100;

  return (
    <div className="mt-1.5 px-2 pb-2">
      <p className="text-white/90 text-xs font-medium truncate">{current.title}</p>
      <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
      {next && (
        <p className="text-white/30 text-xs mt-0.5 truncate">Suivant: {next.title}</p>
      )}
    </div>
  );
}
