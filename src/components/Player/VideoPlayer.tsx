import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '../../store/playerStore';
import { xtreamApi } from '../../services/xtreamApi';
import PlayerControls from './PlayerControls';

export interface HLSTrack {
  id: number;
  name: string;
  lang?: string;
}

export interface HLSLevel {
  height: number;
  bitrate: number;
}

function buildFallbackQueue(
  primaryUrl: string,
  type: string | undefined,
  streamId: number | undefined,
  episodeId: string | undefined,
  containerExtension: string | undefined
): string[] {
  const queue: string[] = [primaryUrl];
  if (type === 'live' || !streamId) return queue;

  const origExt = (containerExtension ?? primaryUrl.split('.').pop() ?? '').toLowerCase();
  const fallbackExts = ['mp4', 'ts', 'mkv', 'm3u8'].filter((e) => e !== origExt);

  try {
    for (const ext of fallbackExts) {
      if (type === 'movie') {
        queue.push(xtreamApi.getVODStreamUrl(streamId, ext));
      } else if (type === 'series' && episodeId) {
        queue.push(xtreamApi.getSeriesEpisodeUrl(episodeId, ext));
      }
    }
  } catch { /* credentials not set */ }

  return queue;
}

export default function VideoPlayer() {
  const { player, isPiP, setIsPiP, closePlayer, updateProgress } = usePlayerStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // URL fallback queue
  const urlQueueRef = useRef<string[]>([]);
  const urlIdxRef = useRef(0);
  // Stable ref so event handlers can call loadUrl without stale closure
  const loadUrlRef = useRef<((url: string) => void) | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const [levels, setLevels] = useState<HLSLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [audioTracks, setAudioTracks] = useState<HLSTrack[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(0);
  const [subtitleTracks, setSubtitleTracks] = useState<HLSTrack[]>([]);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState(-1);

  const changeLevel = useCallback((level: number) => {
    if (hlsRef.current) { hlsRef.current.currentLevel = level; }
    setCurrentLevel(level);
  }, []);

  const changeAudioTrack = useCallback((id: number) => {
    if (hlsRef.current) { hlsRef.current.audioTrack = id; }
    setCurrentAudioTrack(id);
  }, []);

  const changeSubtitleTrack = useCallback((id: number) => {
    if (hlsRef.current) { hlsRef.current.subtitleTrack = id; }
    setCurrentSubtitleTrack(id);
  }, []);

  // Try the next URL in the fallback queue
  const tryNextUrl = useCallback(() => {
    urlIdxRef.current += 1;
    if (urlIdxRef.current < urlQueueRef.current.length) {
      loadUrlRef.current?.(urlQueueRef.current[urlIdxRef.current]);
    } else {
      setError('Impossible de lire ce fichier.');
      setLoading(false);
    }
  }, []);

  const loadUrl = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    setLoading(true);
    setError(null);
    setLevels([]);
    setAudioTracks([]);
    setSubtitleTracks([]);
    setCurrentLevel(-1);
    setCurrentSubtitleTrack(-1);

    const isHLS = url.includes('.m3u8') || url.includes('/live/');

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels.map((l) => ({ height: l.height, bitrate: l.bitrate })));
        setAudioTracks(hls.audioTracks.map((t) => ({ id: t.id, name: t.name, lang: t.lang })));
        setSubtitleTracks(hls.subtitleTracks.map((t) => ({ id: t.id, name: t.name, lang: t.lang })));
        video.play().catch(() => {});
        setLoading(false);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => setCurrentLevel(data.level));
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => setCurrentAudioTrack(data.id));

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) tryNextUrl();
      });
    } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => {});
      setLoading(false);
    } else {
      // Direct file — errors are caught by the video element's error event
      video.src = url;
      video.load();
    }
  }, [tryNextUrl]);

  // Keep ref in sync so event handlers always call the latest version
  useEffect(() => { loadUrlRef.current = loadUrl; }, [loadUrl]);

  const setupStream = useCallback((url: string) => {
    if (progressInterval.current) clearInterval(progressInterval.current);

    // Build fallback queue from player state
    const queue = buildFallbackQueue(
      url,
      player?.type,
      player?.streamId,
      player?.episodeId,
      player?.containerExtension
    );
    urlQueueRef.current = queue;
    urlIdxRef.current = 0;

    loadUrl(url);
  }, [player, loadUrl]);

  useEffect(() => {
    if (!player?.url) return;
    setIsMuted(true);
    setupStream(player.url);
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [player?.url, setupStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !player) return;

    const onLoaded = () => {
      setLoading(false);
      if (player.startTime && player.startTime > 30 && player.type !== 'live') {
        video.currentTime = player.startTime;
      }
    };
    const onCanPlay = () => setLoading(false);
    const onError = () => {
      // Try next fallback before showing error
      urlIdxRef.current += 1;
      if (urlIdxRef.current < urlQueueRef.current.length) {
        loadUrlRef.current?.(urlQueueRef.current[urlIdxRef.current]);
      } else {
        setError('Impossible de lire ce fichier. Format non supporté.');
        setLoading(false);
      }
    };
    const onVolumeChange = () => setIsMuted(video.muted || video.volume === 0);

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);
    video.addEventListener('volumechange', onVolumeChange);

    progressInterval.current = setInterval(() => {
      if (player.type !== 'live' && !video.paused) {
        updateProgress(player.streamId, video.currentTime, video.duration || 0, player.episodeId);
      }
    }, 5000);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.removeEventListener('volumechange', onVolumeChange);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [player, updateProgress]);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (e) { console.error('PiP:', e); }
  }, [setIsPiP]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnter = () => setIsPiP(true);
    const onLeave = () => setIsPiP(false);
    video.addEventListener('enterpictureinpicture', onEnter);
    video.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter);
      video.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, [setIsPiP]);

  const unmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    setIsMuted(false);
  };

  if (!player) return null;

  return (
    <div className={isPiP ? 'hidden' : 'fixed inset-0 z-50 bg-black flex flex-col'}>
      <div className="relative flex-1 bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          autoPlay
          muted
          poster={player.poster}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-black/60 p-6 rounded-xl">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={() => setupStream(player.url)}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {isMuted && !loading && !error && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 pointer-events-none">
            <button
              onClick={unmute}
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full text-white text-sm font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4" />
              </svg>
              Cliquez pour activer le son
            </button>
          </div>
        )}

        <PlayerControls
          videoRef={videoRef}
          title={player.title}
          type={player.type}
          onClose={closePlayer}
          onTogglePiP={togglePiP}
          isPiP={isPiP}
          levels={levels}
          currentLevel={currentLevel}
          onChangeLevel={changeLevel}
          audioTracks={audioTracks}
          currentAudioTrack={currentAudioTrack}
          onChangeAudioTrack={changeAudioTrack}
          subtitleTracks={subtitleTracks}
          currentSubtitleTrack={currentSubtitleTrack}
          onChangeSubtitleTrack={changeSubtitleTrack}
        />
      </div>
    </div>
  );
}
