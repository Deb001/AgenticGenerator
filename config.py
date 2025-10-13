"""
config.py
~~~~~~~~~~

Production‑ready configuration module for the application.

This module uses :class:`pydantic.BaseSettings` to load configuration
values from environment variables (and optionally a ``.env`` file).  It
provides a singleton ``Settings`` instance, a helper to initialise
logging, and a convenient ``get_logger`` function.

Typical usage from other modules:

    from config import get_settings, get_logger

    settings = get_settings()
    logger = get_logger(__name__)

"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

try:
    from pydantic import BaseSettings, Field, ValidationError
except ImportError as exc:
    raise ImportError(
        "pydantic is required for configuration handling. "
        "Install it with `pip install pydantic`."
    ) from exc

# --------------------------------------------------------------------------- #
# Settings definition
# --------------------------------------------------------------------------- #

class Settings(BaseSettings):
    """
    Application configuration settings.

    Values are loaded from environment variables or a ``.env`` file.
    The ``env_file`` attribute is set to ``.env`` in the project root,
    making it convenient to run locally without setting all env vars.
    """

    # General application flags
    DEBUG: bool = Field(False, description="Enable debug mode")
    LOG_LEVEL: str = Field(
        "INFO",
        description="Logging level (e.g., DEBUG, INFO, WARNING, ERROR, CRITICAL)",
    )

    # Database configuration
    DATABASE_URL: str = Field(
        ...,
        description="Database connection URL",
        env="DATABASE_URL",
    )

    # Optional external service key
    API_KEY: Optional[str] = Field(
        None,
        description="API key for external services",
        env="API_KEY",
    )

    # Server settings
    PORT: int = Field(
        8000,
        description="Port on which the application will listen",
        env="PORT",
    )
    TIMEOUT: float = Field(
        30.0,
        description="Request timeout in seconds",
        env="TIMEOUT",
    )

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# --------------------------------------------------------------------------- #
# Singleton pattern for Settings
# --------------------------------------------------------------------------- #

_settings_instance: Optional[Settings] = None

def get_settings() -> Settings:
    """
    Return a singleton instance of :class:`Settings`.

    The first call loads the configuration; subsequent calls return the
    cached instance.

    Raises
    ------
    ValidationError
        If required environment variables are missing or invalid.
    """
    global _settings_instance
    if _settings_instance is None:
        try:
            _settings_instance = Settings()
        except ValidationError as exc:
            # Provide a clear error message for missing env vars
            missing = ", ".join(
                f"{e['loc'][0]}" for e in exc.errors() if e["type"] == "missing"
            )
            raise RuntimeError(
                f"Missing required configuration values: {missing}"
            ) from exc
    return _settings_instance

# --------------------------------------------------------------------------- #
# Logging utilities
# --------------------------------------------------------------------------- #

def init_logging(settings: Settings | None = None) -> None:
    """
    Initialise the root logger based on the provided settings.

    Parameters
    ----------
    settings : Settings, optional
        Configuration instance. If ``None``, :func:`get_settings` is used.
    """
    if settings is None:
        settings = get_settings()

    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # Avoid duplicate handlers if init_logging is called multiple times
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    # Re‑add the handler with the correct level
    handler = logging.StreamHandler()
    handler.setLevel(log_level)
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logging.root.addHandler(handler)

def get_logger(name: str) -> logging.Logger:
    """
    Return a logger instance configured with the application settings.

    Parameters
    ----------
    name : str
        Name of the logger (typically ``__name__``).

    Returns
    -------
    logging.Logger
        Configured logger.
    """
    init_logging()  # Ensure logging is configured
    return logging.getLogger(name)

# --------------------------------------------------------------------------- #
# Environment validation helper
# --------------------------------------------------------------------------- #

def validate_environment(required_vars: list[str]) -> None:
    """
    Ensure that all required environment variables are set.

    Parameters
    ----------
    required_vars : list[str]
        List of environment variable names that must be present.

    Raises
    ------
    RuntimeError
        If any required variable is missing.
    """
    missing = [var for var in required_vars if os.getenv(var) is None]
    if missing:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing)}"
        )

# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #

__all__ = [
    "Settings",
    "get_settings",
    "init_logging",
    "get_logger",
    "validate_environment",
]