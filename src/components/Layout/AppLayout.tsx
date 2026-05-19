import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from '../UI/SearchBar';
import VideoPlayer from '../Player/VideoPlayer';
import { usePlayerStore } from '../../store/playerStore';

export default function AppLayout() {
  const { player, isPiP } = usePlayerStore();

  return (
    <div className="flex min-h-screen bg-[#080810] text-white">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#080810]/80 backdrop-blur border-b border-white/5">
          <div className="flex-1" />
          <SearchBar />
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Full-screen player */}
      <VideoPlayer />

      {/* PiP floating indicator */}
      {isPiP && player && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-white/80 text-sm max-w-[200px] truncate">{player.title}</span>
          <button
            onClick={() => usePlayerStore.getState().closePlayer()}
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
