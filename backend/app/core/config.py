from pydantic import BaseSettings, Field
from typing import List


class Settings(BaseSettings):
    """Typed configuration container loaded from environment variables.

    Attributes:
        PROJECT_NAME: Name of the project.
        VERSION: Application version.
        DEBUG: Enable debug mode.
        DATABASE_URL: Async database URL.
        REDIS_URL: Redis connection URL.
        JWT_SECRET_KEY: Secret key for signing JWTs (minimum 32 characters).
        JWT_ALGORITHM: Algorithm used for JWT.
        ACCESS_TOKEN_EXPIRE_MINUTES: Expiration time for access tokens.
        ALLOWED_HOSTS: List of hosts allowed for CORS.
    """

    PROJECT_NAME: str = Field("Financial Advisor Platform", env="PROJECT_NAME")
    VERSION: str = Field("0.1.0", env="VERSION")
    DEBUG: bool = Field(False, env="DEBUG")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL: str = Field(..., env="REDIS_URL")
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY", min_length=32)
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    ALLOWED_HOSTS: List[str] = Field(["*"], env="ALLOWED_HOSTS")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global singleton instance used throughout the project
settings = Settings()
