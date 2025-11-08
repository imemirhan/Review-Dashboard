'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    // demo creds
    if (user === 'admin' && pass === 'admin') {
      const expires = Date.now() + 30 * 60 * 1000; // 30 min
      localStorage.setItem('adminAuth', JSON.stringify({ token: 'admin', expires }));
      router.push('/dashboard');
    } else {
      setErr('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: '#f8f8f8' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#164f4c' }}>
            <Lock className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Admin Login</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb' }}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb' }}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-2 rounded-md"
            style={{ background: '#164f4c', cursor: 'pointer' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
