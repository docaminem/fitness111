import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ContentType } from '../../types/xtream';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  title: string;
  type: ContentType;
  onClose: () => void;
  onTogglePiP: () => void;
  isPiP: boolean;
}

function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PlayerControls({ videoRef, title, type, onClose, onTogglePiP }: Props) {
  const [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetHide = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [resetHide]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime);
    const onDuration = () => setDuration(video.duration);
    const onVolume = () => { setVolume(video.volume); setMuted(video.muted); };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('volumechange', onVolume);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('volumechange', onVolume);
    };
  }, [videoRef]);

  useEffect(() => {
    const onFS = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFS);
    return () => document.removeEventListener('fullscreenchange', onFS);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = Number(e.target.value);
    v.muted = false;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const toggleFS = async () => {
    const el = containerRef.current?.closest('.fixed') as HTMLElement | null;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  };

  const skip = (sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + sec));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-between"
      onMouseMove={resetHide}
      onClick={resetHide}
    >
      {/* Top bar */}
      <div
        className={`flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white hover:text-violet-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">{title}</span>
        </button>
        <button
          onClick={onTogglePiP}
          title="Picture in Picture"
          className="text-white hover:text-violet-400 transition-colors p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
            <rect x="12" y="10" width="9" height="6" rx="1" strokeWidth={2} fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Center play button */}
      <div className={`flex-1 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={togglePlay}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
        >
          {playing ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Bottom controls */}
      <div
        className={`p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {type !== 'live' && (
          <div className="mb-3 flex items-center gap-2 text-white/80 text-sm">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 relative h-1 group">
              <div className="absolute inset-0 rounded-full bg-white/20" />
              <div className="absolute inset-y-0 left-0 rounded-full bg-violet-500" style={{ width: `${progress}%` }} />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={seek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white hover:text-violet-400 transition-colors">
            {playing ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {type !== 'live' && (
            <>
              <button onClick={() => skip(-10)} className="text-white hover:text-violet-400 transition-colors text-xs font-bold">
                -10s
              </button>
              <button onClick={() => skip(10)} className="text-white hover:text-violet-400 transition-colors text-xs font-bold">
                +10s
              </button>
            </>
          )}

          <div className="flex items-center gap-2 ml-1">
            <button onClick={toggleMute} className="text-white hover:text-violet-400 transition-colors">
              {muted || volume === 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={changeVolume}
              className="w-20 accent-violet-500"
            />
          </div>

          <div className="flex-1" />

          <button onClick={toggleFS} className="text-white hover:text-violet-400 transition-colors">
            {fullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
