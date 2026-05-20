import { useState, useEffect, useRef, useCallback } from 'react';
import type { ContentType } from '../../types/xtream';
import type { HLSLevel, HLSTrack } from './VideoPlayer';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  title: string;
  type: ContentType;
  onClose: () => void;
  onTogglePiP: () => void;
  isPiP: boolean;
  levels: HLSLevel[];
  currentLevel: number;
  onChangeLevel: (l: number) => void;
  audioTracks: HLSTrack[];
  currentAudioTrack: number;
  onChangeAudioTrack: (id: number) => void;
  subtitleTracks: HLSTrack[];
  currentSubtitleTrack: number;
  onChangeSubtitleTrack: (id: number) => void;
}

function fmt(sec: number) {
  if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

type MenuType = 'quality' | 'audio' | 'subtitle' | null;

export default function PlayerControls({
  videoRef, title, type, onClose, onTogglePiP,
  levels, currentLevel, onChangeLevel,
  audioTracks, currentAudioTrack, onChangeAudioTrack,
  subtitleTracks, currentSubtitleTrack, onChangeSubtitleTrack,
}: Props) {
  const [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuType>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    hideTimer.current = setTimeout(() => {
      if (!openMenu) setVisible(false);
    }, 3500);
  }, [openMenu]);

  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [scheduleHide]);

  // Keep visible when menu open or paused
  useEffect(() => {
    if (openMenu || !playing) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
    } else {
      scheduleHide();
    }
  }, [openMenu, playing, scheduleHide]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime);
    const onDur = () => setDuration(video.duration);
    const onVol = () => { setVolume(video.volume); setMuted(video.muted); };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('durationchange', onDur);
    video.addEventListener('volumechange', onVol);
    // initial state
    setPlaying(!video.paused);
    setMuted(video.muted);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('durationchange', onDur);
      video.removeEventListener('volumechange', onVol);
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
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  };

  const seekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const vol = Number(e.target.value);
    v.volume = vol;
    v.muted = vol === 0;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 0.7;
  };

  const skip = (sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + sec));
  };

  const toggleFS = async () => {
    const el = document.fullscreenElement
      ? document
      : (videoRef.current?.closest('.fixed') as HTMLElement | null);
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (el && 'requestFullscreen' in el) {
      await (el as HTMLElement).requestFullscreen();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasSettings = levels.length > 0 || audioTracks.length > 1 || subtitleTracks.length > 0;

  const levelLabel = (l: HLSLevel) =>
    l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)}k`;

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between select-none"
      onMouseMove={scheduleHide}
      onClick={() => { scheduleHide(); setOpenMenu(null); }}
    >
      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={onClose} className="flex items-center gap-2 text-white hover:text-violet-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium max-w-lg truncate">{title}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onTogglePiP(); }} title="Picture in Picture"
          className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={1.5} />
            <rect x="12" y="9" width="9" height="6" rx="1" strokeWidth={1.5} fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Center play/pause on click */}
      <div className="flex-1 flex items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); togglePlay(); scheduleHide(); }}>
        <div className={`transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          {!playing && (
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`px-4 pb-4 pt-8 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}>

        {/* Seek bar */}
        {type !== 'live' && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/70 text-xs w-10 text-right flex-shrink-0">{fmt(currentTime)}</span>
            <div
              className="flex-1 relative h-1.5 rounded-full bg-white/20 cursor-pointer group"
              onClick={seekClick}
            >
              {/* Buffered */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/20" style={{ width: '100%' }} />
              {/* Progress */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-violet-500 group-hover:bg-violet-400 transition-colors" style={{ width: `${progress}%` }} />
              {/* Thumb */}
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 7px)` }} />
              <input
                type="range" min={0} max={duration || 100} step={0.5}
                value={currentTime}
                onChange={seek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-white/70 text-xs w-10 flex-shrink-0">{fmt(duration)}</span>
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center gap-1">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-violet-300 p-1.5 rounded-lg hover:bg-white/10 transition-all">
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

          {/* Skip buttons (not for live) */}
          {type !== 'live' && (
            <>
              <button onClick={() => skip(-10)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all text-xs font-bold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  <text x="9" y="15" fontSize="5" fill="currentColor">10</text>
                </svg>
              </button>
              <button onClick={() => skip(10)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all text-xs font-bold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
              </button>
            </>
          )}

          {/* Volume */}
          <div className="flex items-center gap-1.5 ml-1">
            <button onClick={toggleMute} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
              {muted || volume === 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <input
              type="range" min={0} max={1} step={0.02}
              value={muted ? 0 : volume}
              onChange={changeVolume}
              className="w-20 h-1 accent-violet-500 cursor-pointer"
            />
          </div>

          <div className="flex-1" />

          {/* Settings menu (quality / audio / subtitles) */}
          {hasSettings && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu ? null : 'quality'); }}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
                title="Paramètres"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" strokeWidth={2} />
                </svg>
              </button>

              {openMenu && (
                <div
                  className="absolute bottom-10 right-0 w-64 bg-[#1a1a2e]/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Quality */}
                  {levels.length > 0 && (
                    <div>
                      <p className="px-4 py-2 text-white/40 text-xs uppercase tracking-wider border-b border-white/5">Qualité</p>
                      <button
                        onClick={() => { onChangeLevel(-1); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${currentLevel === -1 ? 'text-violet-400' : 'text-white/80'}`}
                      >
                        Auto {currentLevel === -1 && currentLevel >= 0 ? `(${levelLabel(levels[currentLevel])})` : ''}
                        {currentLevel === -1 && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}
                      </button>
                      {[...levels].reverse().map((l, i) => {
                        const idx = levels.length - 1 - i;
                        return (
                          <button key={idx} onClick={() => onChangeLevel(idx)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${currentLevel === idx ? 'text-violet-400' : 'text-white/80'}`}>
                            {levelLabel(l)}
                            {currentLevel === idx && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Audio tracks */}
                  {audioTracks.length > 1 && (
                    <div>
                      <p className="px-4 py-2 text-white/40 text-xs uppercase tracking-wider border-b border-white/5 border-t border-white/5">Piste audio</p>
                      {audioTracks.map((t) => (
                        <button key={t.id} onClick={() => onChangeAudioTrack(t.id)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${currentAudioTrack === t.id ? 'text-violet-400' : 'text-white/80'}`}>
                          {t.name || t.lang || `Piste ${t.id + 1}`}
                          {currentAudioTrack === t.id && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Subtitles */}
                  {subtitleTracks.length > 0 && (
                    <div>
                      <p className="px-4 py-2 text-white/40 text-xs uppercase tracking-wider border-b border-white/5 border-t border-white/5">Sous-titres</p>
                      <button onClick={() => onChangeSubtitleTrack(-1)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${currentSubtitleTrack === -1 ? 'text-violet-400' : 'text-white/80'}`}>
                        Désactivés
                        {currentSubtitleTrack === -1 && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}
                      </button>
                      {subtitleTracks.map((t) => (
                        <button key={t.id} onClick={() => onChangeSubtitleTrack(t.id)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${currentSubtitleTrack === t.id ? 'text-violet-400' : 'text-white/80'}`}>
                          {t.name || t.lang || `Sous-titre ${t.id + 1}`}
                          {currentSubtitleTrack === t.id && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fullscreen */}
          <button onClick={toggleFS} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
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
