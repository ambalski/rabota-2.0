'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function Home() {
  const [health, setHealth] = useState<{ status?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ padding: '2rem', maxWidth: 600 }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Rabota 2.0</h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Deployed on Render — single-service backend + frontend.
      </p>
      {health && (
        <p>
          API: <strong>{health.status === 'ok' ? 'Connected' : health.status}</strong>
        </p>
      )}
      {error && <p style={{ color: '#f87171' }}>API error: {error}</p>}
    </main>
  );
}
