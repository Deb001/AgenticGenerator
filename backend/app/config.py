from pydantic import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application configuration loaded from environment variables.

    Pydantic automatically reads a .env file if present and validates the
    required fields. An instance of this class is created at import time and
    can be imported throughout the project as ``settings``.
    """

    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


# Export a singleton settings instance for the whole project
settings = Settings()