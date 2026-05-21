"""
Application configuration using Pydantic Settings.

Reads environment variables from a `.env` file located in the same
directory as this module. Every setting has a sensible default so
the app can start in development mode without a `.env` file.
"""

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


_ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    """Central configuration for the AI Career Mentor backend."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── PostgreSQL (Production) ───────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/career_mentor"

    # ── JWT / Auth ────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Groq ──────────────────────────────────────────────────────
    GROQ_API_KEY: Optional[str] = None

    # ── Google OAuth 2.0 ──────────────────────────────────────────
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # ── ChromaDB ──────────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # ── Application ───────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:3000"


# Singleton – import this wherever you need settings
settings = Settings()
