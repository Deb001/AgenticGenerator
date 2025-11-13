import os
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class Config:
    """Application configuration loaded from environment variables."""
    DEBUG: bool = False
    TESTING: bool = False
    ENV: str = os.getenv("FLASK_ENV", "production")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")

    @staticmethod
    def from_env() -> "Config":
        """Create a Config instance respecting environment overrides."""
        debug = os.getenv("DEBUG", "0").lower() in ("1", "true", "yes")
        testing = os.getenv("TESTING", "0").lower() in ("1", "true", "yes")
        return Config(
            DEBUG=debug,
            TESTING=testing,
            ENV=os.getenv("FLASK_ENV", "production"),
            SECRET_KEY=os.getenv("SECRET_KEY", "change-me")
        )
