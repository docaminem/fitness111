import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { isSupabaseConfigured } from './services/supabase';
import AppLayout from './components/Layout/AppLayout';
import SignInPage from './pages/SignInPage';
import PlaylistsPage from './pages/PlaylistsPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LiveTVPage from './pages/LiveTVPage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import FavoritesPage from './pages/FavoritesPage';
import SearchPage from './pages/SearchPage';

// ─── Mode Cloud (Supabase configuré) ─────────────────────────────────────────
function CloudApp() {
  const { user, activePlaylist, restoreSession: restoreApp } = useAppStore();
  const { isAuthenticated, restoreSession: restoreIptv } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const hasSession = await restoreApp();
      if (hasSession && !isAuthenticated) {
        // App session restored but no active IPTV playlist yet
      }
      // Also try to restore IPTV session from localStorage as fallback
      if (!isAuthenticated) await restoreIptv();
      setLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/signin"
        element={user ? <Navigate to="/playlists" replace /> : <SignInPage />}
      />

      {/* Playlist selection */}
      <Route
        path="/playlists"
        element={!user ? <Navigate to="/signin" replace /> : <PlaylistsPage />}
      />

      {/* Main app — requires cloud login + active playlist */}
      <Route
        path="/"
        element={
          !user ? <Navigate to="/signin" replace />
          : !activePlaylist && !isAuthenticated ? <Navigate to="/playlists" replace />
          : <AppLayout />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="live" element={<LiveTVPage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Mode Local (pas de Supabase) ────────────────────────────────────────────
function LocalApp() {
  const { isAuthenticated, restoreSession } = useAuthStore();
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    restoreSession().finally(() => setRestoring(false));
  }, [restoreSession]);

  if (restoring) return <Spinner />;

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<HomePage />} />
        <Route path="live" element={<LiveTVPage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return isSupabaseConfigured ? <CloudApp /> : <LocalApp />;
}
