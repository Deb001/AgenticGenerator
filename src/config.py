from pydantic import BaseSettings, Field
from typing import Optional

class Settings(BaseSettings):
    """Application configuration loaded from environment variables.

    All fields have type validation and sensible defaults where appropriate.
    """

    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REDIS_URL: Optional[str] = Field(default=None, env="REDIS_URL")
    CELERY_BROKER_URL: str = Field(..., env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(..., env="CELERY_RESULT_BACKEND")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    CORS_ORIGINS: str = Field(default="*", env="CORS_ORIGINS")

    class Config:
        case_sensitive = False
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instantiate a singleton settings object that can be imported throughout the project
settings = Settings()
