import os
from typing import Any

from dotenv import load_dotenv

# Load environment variables from a .env file if present.
load_dotenv()


class Config:
    """
    Central configuration class.

    Reads environment variables at import time and provides sensible defaults
    when they are missing or malformed.
    """

    # Default values
    _DEFAULT_SECRET_KEY: str = "change-me"
    _DEFAULT_DEBUG: bool = False
    _DEFAULT_PORT: int = 5000

    @staticmethod
    def _to_bool(value: Any) -> bool:
        """Convert common truthy strings to a boolean."""
        if isinstance(value, bool):
            return value
        if not isinstance(value, str):
            return Config._DEFAULT_DEBUG
        return value.strip().lower() in {"true", "1", "yes", "on"}

    @staticmethod
    def _to_int(value: Any, fallback: int) -> int:
        """Safely convert a value to int, falling back on error."""
        try:
            return int(value)
        except (TypeError, ValueError):
            return fallback

    # Configuration attributes populated from the environment
    SECRET_KEY: str = os.getenv("SECRET_KEY", _DEFAULT_SECRET_KEY)
    DEBUG: bool = _to_bool.__func__(os.getenv("DEBUG"))
    PORT: int = _to_int(os.getenv("PORT"), _DEFAULT_PORT)

    @classmethod
    def as_dict(cls) -> dict[str, Any]:
        """Return the configuration as a dictionary."""
        return {
            "SECRET_KEY": cls.SECRET_KEY,
            "DEBUG": cls.DEBUG,
            "PORT": cls.PORT,
        }