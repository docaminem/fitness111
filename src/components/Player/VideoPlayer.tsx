import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '../../store/playerStore';
import PlayerControls from './PlayerControls';

export default function VideoPlayer() {
  const { player, isPiP, setIsPiP, closePlayer, updateProgress } = usePlayerStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setupHls = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setLoading(true);
    setError(null);

    if (url.endsWith('.m3u8') || url.includes('/live/')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setLoading(false);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError('Stream error. Please try again.');
          setLoading(false);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(() => {});
        setLoading(false);
      }
    } else {
      video.src = url;
      video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!player?.url) return;
    setupHls(player.url);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [player?.url, setupHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !player) return;

    const handleLoaded = () => {
      setLoading(false);
      if (player.startTime && player.startTime > 0 && player.type !== 'live') {
        video.currentTime = player.startTime;
      }
    };

    const handleProgress = () => {
      if (player.type !== 'live') {
        updateProgress(player.streamId, video.currentTime, video.duration || 0, player.episodeId);
      }
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('canplay', () => setLoading(false));
    video.addEventListener('error', () => setError('Playback error'));

    progressInterval.current = setInterval(handleProgress, 5000);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
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
    } catch (e) {
      console.error('PiP error:', e);
    }
  }, [setIsPiP]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnterPiP = () => setIsPiP(true);
    const onLeavePiP = () => setIsPiP(false);
    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, [setIsPiP]);

  if (!player) return null;

  return (
    <div
      className={`${
        isPiP ? 'hidden' : 'fixed inset-0 z-50 bg-black flex flex-col'
      }`}
    >
      <div className="relative flex-1 bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          poster={player.poster}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={() => setupHls(player.url)}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <PlayerControls
          videoRef={videoRef}
          title={player.title}
          type={player.type}
          onClose={closePlayer}
          onTogglePiP={togglePiP}
          isPiP={isPiP}
        />
      </div>
    </div>
  );
}
