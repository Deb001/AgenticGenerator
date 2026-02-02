import os
from pydantic import BaseSettings, Field, EmailStr

class Settings(BaseSettings):
    """Application configuration loaded from environment variables or a .env file."""

    # Database URL
    DB_URL: str = Field(default="sqlite:///./test.db", env="DB_URL")

    # JWT configuration
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Email (SMTP) configuration – defaults point to a local debugging server
    EMAIL_HOST: str = Field(default="localhost", env="EMAIL_HOST")
    EMAIL_PORT: int = Field(default=1025, env="EMAIL_PORT")
    EMAIL_USERNAME: str = Field(default="", env="EMAIL_USERNAME")
    EMAIL_PASSWORD: str = Field(default="", env="EMAIL_PASSWORD")

    # Google OAuth configuration (optional – required for Google login)
    GOOGLE_CLIENT_ID: str = Field(default="", env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", env="GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = Field(
        default="http://localhost:8000/api/auth/google/callback",
        env="GOOGLE_REDIRECT_URI",
    )

    # CORS – comma‑separated list of allowed origins (frontend URL)
    CORS_ORIGINS: str = Field(default="http://localhost:5173", env="CORS_ORIGINS")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
