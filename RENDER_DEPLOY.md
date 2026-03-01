# Deploy Rabota 2.0 to Render.com

This repo is a **complete runnable app**: backend (FastAPI + auth + DB) and frontend (Next.js static export). Follow the steps below to deploy.

## Prerequisites
- GitHub account
- OpenAI API key ([platform.openai.com](https://platform.openai.com) → API Keys)
- Email for verification

## Option A: Single Web Service (easiest)

One service serves both API and frontend static files.

1. **Push to GitHub**
   ```bash
   cd rabota-2.0
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/rabota-2.0.git
   git push -u origin main
   ```

2. **Create Web Service on Render**
   - [render.com](https://render.com) → **New +** → **Web Service**
   - Connect GitHub, select `rabota-2.0`
   - **Settings:**
     - **Name:** `rabota-20-app`
     - **Environment:** Python
     - **Build Command:**
       ```bash
       cd frontend && npm install && npm run build
       cd ../backend && pip install -r requirements.txt
       ```
       (On Render, `pip` is available. Locally on Mac use `python3 -m pip install -r requirements.txt` if `pip` is not found.)
     - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Root Directory:** (leave empty)
     - **Branch:** main

3. **Environment variables** (Advanced → Add Environment Variable)
   - `SECRET_KEY` — long random string (32+ chars)
   - `OPENAI_API_KEY` — `sk-...` from OpenAI
   - `DATABASE_URL` — from Render PostgreSQL (create DB first if needed)
   - `REDIS_URL` — from Render Redis (optional; add Redis if you use it)
   - `NEXT_PUBLIC_API_BASE_URL` — `https://rabota-20-app.onrender.com/api`

4. **Create Web Service** and wait ~5–10 minutes.

5. **First-time setup**
   - In Render dashboard → your service → **Shell**
   - Run:
     ```bash
     cd backend && python3 -m alembic upgrade head
     python3 scripts/setup_admin.py
     ```
     (On Render, `alembic` and `python` are on PATH; locally use `python3 -m alembic` if needed.)
   - Enter admin email and password when prompted.

**App URL:** `https://rabota-20-app.onrender.com`

---

## Option B: Backend + Static Frontend (two services)

- **Backend:** New + → Web Service, Root Directory empty, Build: `pip install -r backend/requirements.txt`, Start: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Frontend:** New + → Static Site, Build: `cd frontend && npm install && npm run build`, Publish: `frontend/out`
- Set `NEXT_PUBLIC_API_BASE_URL` on frontend to your backend URL (e.g. `https://rabota-backend.onrender.com/api`).

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Build fails | Logs in Render; ensure `backend/requirements.txt` and `frontend/package.json` exist |
| API 404 / CORS | CORS in `backend/app/main.py`; correct `NEXT_PUBLIC_API_BASE_URL` |
| DB connection | Use **Internal** Database URL from Render; run `alembic upgrade head` in Shell |
| No admin user | Run `python backend/scripts/setup_admin.py` in Render Shell |
| psycopg2 / Python 3.14 | Repo has `.python-version` with `3.12.8` so Render uses Python 3.12. Or set env var `PYTHON_VERSION=3.12.8` in Render dashboard. |
