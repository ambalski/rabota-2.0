"""
Rabota 2.0 - FastAPI backend.
For single-service Render deploy: serves frontend static files from frontend/out when present.
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Rabota 2.0 API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import api_router

app.include_router(api_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# --- Single-service deploy: serve frontend build (must be last so /api/* is handled above) ---
frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "out")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
