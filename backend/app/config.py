import os
from pathlib import Path
from typing import List

from pydantic import BaseSettings, Field, AnyUrl, validator


class Settings(BaseSettings):
    """Application configuration loaded from environment variables.

    The class uses pydantic's BaseSettings which reads from the environment
    and a ``.env`` file located at the project root.
    """

    # Core settings
    PROJECT_NAME: str = "Portfolio Manager"
    DEBUG: bool = False
    ALLOWED_HOSTS: List[str] = Field(default_factory=lambda: ["*"])

    # Database
    DATABASE_URL: AnyUrl = Field(..., env="DATABASE_URL")

    # JWT settings
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth
    GOOGLE_CLIENT_ID: str = Field(..., env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(..., env="GOOGLE_CLIENT_SECRET")
    GOOGLE_OAUTH_REDIRECT_URI: AnyUrl = Field(..., env="GOOGLE_OAUTH_REDIRECT_URI")

    # Email (SMTP) – placeholder for future implementation
    EMAIL_SMTP_URL: AnyUrl = Field(default="smtp://localhost:1025", env="EMAIL_SMTP_URL")

    # Rate limiting
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_MAX_REQUESTS: int = 30

    @validator("ALLOWED_HOSTS", pre=True)
    def _split_allowed_hosts(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Export a single Settings instance for the whole project.
settings = Settings()
