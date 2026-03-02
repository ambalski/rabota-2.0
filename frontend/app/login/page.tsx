'use client';

import { FormEvent, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<{ email: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMe(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Login failed');
      }
      const data = await res.json();
      const token = data.access_token as string;
      // сохраняем токен в localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('rabota_token', token);
      }
      // сразу узнаём "кто я"
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        setMe({ email: meData.email });
      }
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('rabota_token');
    }
    setMe(null);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#020617',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 18px 45px rgba(15,23,42,0.75)',
          border: '1px solid #1e293b',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Rabota 2.0</h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Вход для админа</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                marginTop: 4,
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </label>

          <label style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                marginTop: 4,
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.75rem',
              padding: '0.7rem 1rem',
              borderRadius: 999,
              border: 'none',
              background: loading ? '#1e293b' : '#22c55e',
              color: '#020617',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>

        {error && (
          <p style={{ marginTop: '0.75rem', color: '#f97373', fontSize: '0.9rem' }}>
            Ошибка: {error}
          </p>
        )}

        {me && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 8, background: '#0b1120' }}>
            <p style={{ marginBottom: '0.25rem' }}>Вы вошли как:</p>
            <p style={{ fontWeight: 600 }}>{me.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginTop: '0.5rem',
                padding: '0.4rem 0.8rem',
                borderRadius: 999,
                border: '1px solid #1e293b',
                background: 'transparent',
                color: '#cbd5f5',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Выйти
            </button>
          </div>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          Здоровье API можно посмотреть на главной странице{' '}
          <a href="/" style={{ color: '#38bdf8' }}>
            /
          </a>
          .
        </p>
      </div>
    </main>
  );
}

