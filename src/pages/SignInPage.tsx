import { useState, FormEvent } from 'react';
import { useAppStore } from '../store/appStore';

export default function SignInPage() {
  const { signIn, signUp, loading, error, clearError } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    if (mode === 'register') {
      if (password !== confirm) { setLocalError('Les mots de passe ne correspondent pas.'); return; }
      if (password.length < 6) { setLocalError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mb-4 shadow-2xl shadow-violet-600/30">
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">IPTV Premium</h1>
          <p className="text-white/40 text-sm mt-1">Vos playlists, partout</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); clearError(); setLocalError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-violet-600 text-white shadow' : 'text-white/50 hover:text-white'}`}>
              Connexion
            </button>
            <button
              onClick={() => { setMode('register'); clearError(); setLocalError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-violet-600 text-white shadow' : 'text-white/50 hover:text-white'}`}>
              Créer un compte
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {displayError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {displayError}
              </div>
            )}
            {mode === 'register' && (
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-4 py-3 text-violet-300 text-xs">
                📧 Un email de confirmation sera envoyé. Vérifiez votre boîte mail.
              </div>
            )}

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 text-sm transition-colors"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">Confirmer le mot de passe</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 text-sm transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Chargement...</>
              ) : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
