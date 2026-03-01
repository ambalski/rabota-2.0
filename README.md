# Rabota 2.0

Full-stack app (FastAPI + Next.js) ready to deploy on [Render.com](https://render.com).

## Project structure

- **backend/** — FastAPI app, auth (JWT), SQLAlchemy + Alembic, `/api/health` and `/api/auth/login`, `/api/auth/me`
- **frontend/** — Next.js 14 with static export (`out/`), uses `NEXT_PUBLIC_API_BASE_URL` for API

Single-service deploy: backend serves the frontend from `frontend/out` when present.

## Run locally

**Backend** (from repo root):

```bash
cd backend
python3 -m pip install -r requirements.txt
# Optional: set DATABASE_URL or use default sqlite
python3 -m alembic upgrade head
python3 -m uvicorn app.main:app --reload --port 8000
```

Create first admin user:

```bash
cd backend && python3 scripts/setup_admin.py
```

> **Tip:** If `uvicorn` or `alembic` are not found, use `python3 -m uvicorn` and `python3 -m alembic` (scripts may be in `~/Library/Python/3.9/bin` which is not on PATH).

**Frontend** (separate terminal):

```bash
cd frontend
npm install && npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` in `frontend/.env.local` if the API runs on 8000.

## Deploy to Render

See **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)** for step-by-step instructions (single service or backend + static site).

## Environment variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | Postgres URL (Render: use Internal URL). `postgres://` is auto-converted to `postgresql://`. |
| `SECRET_KEY` | Backend | JWT signing key (32+ chars in production) |
| `OPENAI_API_KEY` | Backend | OpenAI API key |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | API base, e.g. `https://rabota-20-app.onrender.com/api` |
