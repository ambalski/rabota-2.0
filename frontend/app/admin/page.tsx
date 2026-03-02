'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

type Me = {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
};

export default function AdminPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMe() {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== 'undefined' ? window.localStorage.getItem('rabota_token') : null;
      if (!token) {
        setError('Вы не авторизованы. Перейдите на страницу входа /login.');
        setMe(null);
        return;
      }
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError('Сессия истекла или токен неверен. Войдите заново на странице /login.');
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('rabota_token');
          }
          setMe(null);
          return;
        }
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Не удалось получить данные пользователя');
      }
      const data = (await res.json()) as Me;
      setMe(data);
    } catch (err: any) {
      setError(err.message ?? 'Неизвестная ошибка');
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('rabota_token');
    }
    setMe(null);
    setError('Вы вышли из системы. Войдите снова на странице /login.');
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
          maxWidth: 640,
          background: '#020617',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 18px 45px rgba(15,23,42,0.75)',
          border: '1px solid #1e293b',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Rabota 2.0 — админка</h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
          Приватная страница, доступна только после успешного входа.
        </p>

        {loading && <p style={{ color: '#cbd5f5' }}>Загружаем данные…</p>}

        {error && (
          <p style={{ marginTop: '0.75rem', color: '#f97373', fontSize: '0.9rem' }}>
            {error}{' '}
            <a href="/login" style={{ color: '#38bdf8' }}>
              /login
            </a>
          </p>
        )}

        {me && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: 12,
              background: '#0b1120',
              border: '1px solid #1e293b',
            }}
          >
            <p style={{ marginBottom: '0.5rem', color: '#e5e7eb' }}>Вы вошли как:</p>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>{me.email}</p>
            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#9ca3af' }}>
              ID: {me.id} · superuser: {me.is_superuser ? 'да' : 'нет'}
            </p>

            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={loadMe}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 999,
                  border: '1px solid #1e293b',
                  background: 'transparent',
                  color: '#cbd5f5',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Обновить
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 999,
                  border: 'none',
                  background: '#ef4444',
                  color: '#f9fafb',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Выйти
              </button>
            </div>
          </div>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          Главная страница мониторинга API:{' '}
          <a href="/" style={{ color: '#38bdf8' }}>
            /
          </a>
        </p>
      </div>
    </main>
  );
}

