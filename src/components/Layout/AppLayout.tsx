import { Outlet, NavLink } from 'react-router-dom';
import Sidebar, { navItems } from './Sidebar';
import SearchBar from '../UI/SearchBar';
import VideoPlayer from '../Player/VideoPlayer';
import { usePlayerStore } from '../../store/playerStore';

// Bottom 5 nav items for mobile (exclude search to save space, fold into icon)
const mobileNav = navItems.slice(0, 5);

export default function AppLayout() {
  const { player, isPiP } = usePlayerStore();

  return (
    <div className="flex min-h-screen bg-[#080810] text-white">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width on md+ */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 bg-[#080810]/80 backdrop-blur border-b border-white/5">
          {/* IPTV logo — mobile only */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-sm">IPTV</span>
          </div>
          <div className="flex-1" />
          <SearchBar />
        </header>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0d0d1a]/95 backdrop-blur border-t border-white/5 flex safe-area-bottom">
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-violet-400' : 'text-white/40 active:text-white/70'
              }`
            }
          >
            {item.icon}
            <span className="leading-none">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
        {/* Search icon as 6th slot */}
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-violet-400' : 'text-white/40 active:text-white/70'
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="leading-none">Chercher</span>
        </NavLink>
      </nav>

      {/* Full-screen player */}
      <VideoPlayer />

      {/* PiP floating indicator */}
      {isPiP && player && (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50 bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-white/80 text-sm max-w-[160px] truncate">{player.title}</span>
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
