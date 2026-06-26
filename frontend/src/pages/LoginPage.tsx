// LoginPage — username/password form that calls AuthContext.login and
// redirects to /dashboard on success (D-17 prerequisite: login must exist
// before the dashboard is accessible).
//
// Auth flow: POST /api/auth/login via apiClient → AuthContext stores the
// token + user → redirect to /dashboard. Failed login shows an Indonesian
// error message. If the user is already authenticated, visiting /login
// bounces to /dashboard.

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in? Bounce to the dashboard (simple v1 redirect —
  // matches the logout + 401 redirect mechanism in AuthContext/apiClient).
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // login() throws on bad credentials (apiClient throws on non-ok), so
      // reaching the next line means success.
      await login(username, password);
      window.location.href = '/dashboard';
      // Leave loading=true during the redirect; only reset on error.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-800 bg-gray-900 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-amber-400">RestoPulse</h1>
          <p className="mt-1 text-lg text-gray-300">Dasbor Analitik Restoran</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm text-gray-300"
            >
              Nama Pengguna
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              placeholder="nama pengguna"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm text-gray-300"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-500 px-4 py-2.5 font-semibold text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
