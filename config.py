"""
config.py
---------

Central configuration module for the project.

The module defines a :class:`Settings` class based on *pydantic*'s
``BaseSettings`` which reads configuration values from environment
variables, a ``.env`` file or defaults.  It also provides a ready‑to‑use
logger configured according to the loaded settings.

Typical usage::

    from config import settings, get_logger

    logger = get_logger(__name__)
    logger.info("Application started")
    if settings.DEBUG:
        ...

The configuration values are deliberately kept generic so they can be
re‑used by any component of the project (e.g. a Flask API, background
workers, CLI tools, etc.).
"""

from __future__ import annotations

import logging
import logging.config
import os
from pathlib import Path
from typing import List, Optional

from pydantic import BaseSettings, Field, validator

# --------------------------------------------------------------------------- #
# Settings definition
# --------------------------------------------------------------------------- #


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    The class automatically reads a ``.env`` file located in the project
    root (if present) and validates the values.  All fields are typed,
    documented and have sensible defaults for a production environment.
    """

    # Core flags -------------------------------------------------------------
    DEBUG: bool = Field(
        default=False,
        description="Enable debug mode (verbose logging, auto‑reload, etc.).",
    )
    TESTING: bool = Field(
        default=False,
        description="Indicates that the application is running under test.",
    )

    # Security ---------------------------------------------------------------
    SECRET_KEY: str = Field(
        ...,
        description="Secret key used for cryptographic signing (e.g. Flask sessions).",
    )
    ALLOWED_HOSTS: List[str] = Field(
        default_factory=lambda: ["*"],
        description="List of hostnames/IPs the server will accept requests from.",
    )

    # Database ---------------------------------------------------------------
    DATABASE_URL: str = Field(
        ...,
        description="SQLAlchemy compatible database URL, e.g. "
        "'postgresql://user:pass@host:5432/dbname'.",
    )
    DATABASE_POOL_SIZE: int = Field(
        default=10,
        ge=1,
        description="Maximum number of connections in the DB pool.",
    )

    # Logging ----------------------------------------------------------------
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Root logger level. One of DEBUG, INFO, WARNING, ERROR, CRITICAL.",
    )
    LOG_FORMAT: str = Field(
        default="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        description="Format string used by the default logger.",
    )
    LOG_FILE: Optional[Path] = Field(
        default=None,
        description="If set, logs are also written to this file (rotated daily).",
    )

    # Misc -------------------------------------------------------------------
    STATIC_ROOT: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parent.parent / "static",
        description="Directory that contains static assets (HTML, CSS, JS).",
    )
    TEMPLATE_ROOT: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parent.parent / "templates",
        description="Directory that contains Jinja2 templates (if used).",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    # --------------------------------------------------------------------- #
    # Validators
    # --------------------------------------------------------------------- #

    @validator("LOG_LEVEL")
    def _validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        v_upper = v.upper()
        if v_upper not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {allowed}, got '{v}'.")
        return v_upper

    @validator("ALLOWED_HOSTS", pre=True)
    def _split_allowed_hosts(cls, v):
        """
        Accept a comma‑separated string or a list.
        """
        if isinstance(v, str):
            return [host.strip() for host in v.split(",") if host.strip()]
        return v

    @validator("STATIC_ROOT", "TEMPLATE_ROOT", pre=True)
    def _ensure_path(cls, v):
        return Path(v).expanduser().resolve()


# --------------------------------------------------------------------------- #
# Global settings instance (singleton)
# --------------------------------------------------------------------------- #

settings: Settings = Settings()  # type: ignore[assignment]


# --------------------------------------------------------------------------- #
# Logging configuration utilities
# --------------------------------------------------------------------------- #


def _build_logging_config() -> dict:
    """
    Construct a dict compatible with ``logging.config.dictConfig`` based on
    the current :data:`settings`.
    """
    handlers = {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "level": settings.LOG_LEVEL,
        }
    }

    if settings.LOG_FILE:
        handlers["file"] = {
            "class": "logging.handlers.TimedRotatingFileHandler",
            "formatter": "standard",
            "level": settings.LOG_LEVEL,
            "filename": str(settings.LOG_FILE),
            "when": "midnight",
            "backupCount": 7,
            "encoding": "utf-8",
        }

    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": settings.LOG_FORMAT,
                "datefmt": "%Y-%m-%d %H:%M:%S",
            }
        },
        "handlers": handlers,
        "root": {
            "level": settings.LOG_LEVEL,
            "handlers": list(handlers.keys()),
        },
    }
    return config


def configure_logging() -> None:
    """
    Apply the logging configuration globally.  This function is idempotent;
    calling it multiple times will simply re‑configure the logging system.
    """
    config_dict = _build_logging_config()
    logging.config.dictConfig(config_dict)


def get_logger(name: str | None = None) -> logging.Logger:
    """
    Return a logger instance with the name ``name`` (or the caller's module
    name if ``None``).  The logging system is configured on first call.

    Parameters
    ----------
    name:
        Optional logger name.  If omitted, ``logging.getLogger(__name__)`` is used.

    Returns
    -------
    logging.Logger
        Configured logger.
    """
    if not logging.getLogger().handlers:
        configure_logging()
    return logging.getLogger(name)


# --------------------------------------------------------------------------- #
# Exported symbols
# --------------------------------------------------------------------------- #

__all__ = ["settings", "configure_logging", "get_logger", "Settings"]