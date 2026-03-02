from fastapi import APIRouter

from app.api import auth, employer

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employer.router, prefix="/employer", tags=["employer"])
