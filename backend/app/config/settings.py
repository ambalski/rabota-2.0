"""App settings from environment."""
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "change-me-in-production"
    database_url: str = "sqlite:///./rabota.db"
    redis_url: Optional[str] = None
    openai_api_key: Optional[str] = None
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
