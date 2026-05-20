import { useState, FormEvent } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import type { Playlist } from '../types/app';

export default function PlaylistsPage() {
  const { user, playlists, addPlaylist, deletePlaylist, setActivePlaylist, signOut } = useAppStore();
  const { login } = useAuthStore();
  const { clearAll } = useContentStore();
  const [showForm, setShowForm] = useState(playlists.length === 0);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // New playlist form state
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await addPlaylist({ name: name || 'Playlist', host, port, username, password });
    setName(''); setHost(''); setPort(''); setUsername(''); setPassword('');
    setShowForm(false);
    setLoading(false);
  };

  const handleConnect = async (p: Playlist) => {
    setConnectingId(p.id);
    setError('');
    clearAll();
    try {
      await login({ host: p.host, port: p.port, username: p.username, password: p.password });
      setActivePlaylist(p);
    } catch {
      setError(`Impossible de se connecter à "${p.name}". Vérifiez les identifiants.`);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mes Playlists</h1>
              <p className="text-white/40 text-xs">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Existing playlists */}
        {playlists.length > 0 && (
          <div className="space-y-3 mb-6">
            {playlists.map((p) => (
              <div key={p.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{p.name}</p>
                  <p className="text-white/40 text-xs truncate">{p.host}{p.port ? `:${p.port}` : ''} · {p.username}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleConnect(p)}
                    disabled={connectingId === p.id}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    {connectingId === p.id ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion...</>
                    ) : 'Regarder'}
                  </button>
                  <button
                    onClick={() => deletePlaylist(p.id)}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add playlist */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full border-2 border-dashed border-white/10 hover:border-violet-500/40 rounded-xl p-5 text-white/40 hover:text-violet-400 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une playlist Xtream
          </button>
        ) : (
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une playlist Xtream
            </h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1">Nom (optionnel)</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ma playlist"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-white/50 text-xs font-medium block mb-1">Serveur (host)</label>
                  <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="http://server.com" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1">Port</label>
                  <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="8080"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1">Nom d'utilisateur</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1">Mot de passe</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-lg text-white font-medium text-sm transition-colors">
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
                {playlists.length > 0 && (
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 text-sm transition-colors">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
