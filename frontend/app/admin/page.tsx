'use client';

import { useEffect, useState, FormEvent } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

type Me = {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
};

type Employer = {
  id: number;
  user_id: number;
  company_name_anonymized?: string | null;
  industry?: string | null;
  size?: string | null;
  stage?: string | null;
  location?: string | null;
  timezone?: string | null;
  remote_policy?: string | null;
  compensation_bracket?: string | null;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('rabota_token');
}

export default function AdminPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [form, setForm] = useState<Partial<Employer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMe() {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Вы не авторизованы. Перейдите на страницу входа /login.');
        setMe(null);
        setEmployer(null);
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
          setEmployer(null);
          return;
        }
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Не удалось получить данные пользователя');
      }
      const data = (await res.json()) as Me;
      setMe(data);
      await loadEmployer();
    } catch (err: any) {
      setError(err.message ?? 'Неизвестная ошибка');
      setMe(null);
      setEmployer(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployer() {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/employer/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        setEmployer(null);
        setForm({});
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Не удалось получить профиль нанимателя');
      }
      const data = (await res.json()) as Employer;
      setEmployer(data);
      setForm({
        company_name_anonymized: data.company_name_anonymized ?? '',
        industry: data.industry ?? '',
        size: data.size ?? '',
        stage: data.stage ?? '',
        location: data.location ?? '',
        timezone: data.timezone ?? '',
        remote_policy: data.remote_policy ?? '',
        compensation_bracket: data.compensation_bracket ?? '',
      });
    } catch (err: any) {
      setError(err.message ?? 'Не удалось загрузить профиль нанимателя');
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
    setEmployer(null);
    setError('Вы вышли из системы. Войдите снова на странице /login.');
  }

  function updateField<K extends keyof Employer>(key: K, value: Employer[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Нет токена. Перейдите на /login и войдите заново.');
        return;
      }
      const method = employer ? 'PATCH' : 'POST';
      const url = employer ? `${API_BASE}/employer/me` : `${API_BASE}/employer`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Не удалось сохранить профиль нанимателя');
      }
      const data = (await res.json()) as Employer;
      setEmployer(data);
      setForm({
        company_name_anonymized: data.company_name_anonymized ?? '',
        industry: data.industry ?? '',
        size: data.size ?? '',
        stage: data.stage ?? '',
        location: data.location ?? '',
        timezone: data.timezone ?? '',
        remote_policy: data.remote_policy ?? '',
        compensation_bracket: data.compensation_bracket ?? '',
      });
    } catch (err: any) {
      setError(err.message ?? 'Неизвестная ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
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
          maxWidth: 820,
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
              marginBottom: '1.5rem',
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

        {me && (
          <section
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              borderRadius: 12,
              background: '#020617',
              border: '1px solid #1e293b',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Профиль нанимателя</h2>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1rem' }}>
              Эти данные используются для мэтча. Название компании обезличено.
            </p>

            <form
              onSubmit={handleSave}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <label style={{ fontSize: '0.85rem', color: '#cbd5f5' }}>
                Название (обезличенное)
                <input
                  type="text"
                  value={form.company_name_anonymized ?? ''}
                  onChange={(e) => updateField('company_name_anonymized', e.target.value)}
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
                Индустрия
                <input
                  type="text"
                  value={form.industry ?? ''}
                  onChange={(e) => updateField('industry', e.target.value)}
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
                Размер компании
                <input
                  type="text"
                  value={form.size ?? ''}
                  onChange={(e) => updateField('size', e.target.value)}
                  placeholder="например, 10-50"
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
                Стадия
                <input
                  type="text"
                  value={form.stage ?? ''}
                  onChange={(e) => updateField('stage', e.target.value)}
                  placeholder="Seed / Series A / Bootstrap…"
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
                Локация
                <input
                  type="text"
                  value={form.location ?? ''}
                  onChange={(e) => updateField('location', e.target.value)}
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
                Таймзона
                <input
                  type="text"
                  value={form.timezone ?? ''}
                  onChange={(e) => updateField('timezone', e.target.value)}
                  placeholder="CET, EET, MSK…"
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
                Формат работы
                <input
                  type="text"
                  value={form.remote_policy ?? ''}
                  onChange={(e) => updateField('remote_policy', e.target.value)}
                  placeholder="remote-first / hybrid / office"
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
                Вилка компенсации
                <input
                  type="text"
                  value={form.compensation_bracket ?? ''}
                  onChange={(e) => updateField('compensation_bracket', e.target.value)}
                  placeholder="€50k-80k"
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
                disabled={saving}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 999,
                  border: 'none',
                  background: saving ? '#1e293b' : '#22c55e',
                  color: '#020617',
                  fontWeight: 600,
                  cursor: saving ? 'default' : 'pointer',
                }}
              >
                {saving ? 'Сохраняем…' : employer ? 'Сохранить изменения' : 'Создать профиль'}
              </button>
            </form>
          </section>
        )}

        {me && (
          <section
            style={{
              marginTop: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                borderRadius: 12,
                background: '#020617',
                border: '1px solid #1e293b',
              }}
            >
              <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Роли</h2>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                Здесь будет список обезличенных ролей и создание новых. Пока это макет.
              </p>
              <button
                type="button"
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: 999,
                  border: 'none',
                  background: '#22c55e',
                  color: '#020617',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'default',
                }}
              >
                + Создать роль (скоро)
              </button>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 12,
                background: '#020617',
                border: '1px solid #1e293b',
              }}
            >
              <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Мэтчи</h2>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                Здесь появится список обезличенных кандидатов и статусы мэтчей.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Пример: “Кандидат #1234 — 4.8 ★ — статус: в ожидании”.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 12,
                background: '#020617',
                border: '1px solid #1e293b',
              }}
            >
              <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Интервью</h2>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                Тут будут настройки сценария ИИ-интервью и версии вопросов.
              </p>
              <button
                type="button"
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: 999,
                  border: '1px solid #1e293b',
                  background: 'transparent',
                  color: '#cbd5f5',
                  fontSize: '0.85rem',
                  cursor: 'default',
                }}
              >
                Настроить сценарий (в разработке)
              </button>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 12,
                background: '#020617',
                border: '1px solid #1e293b',
              }}
            >
              <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Аналитика</h2>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                Здесь появятся базовые метрики: конверсия сценария, качество мэтчей и т.д.
              </p>
              <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                <li>Запуск интервью → профиль → мэтч</li>
                <li>Средний рейтинг мэтчей</li>
                <li>Частые темы вопросов</li>
              </ul>
            </div>
          </section>
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

