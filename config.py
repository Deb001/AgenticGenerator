"""
config.py
---------

Central configuration module for the project.

The module defines a hierarchy of configuration classes that can be
instantiated based on the ``CONFIG_ENV`` environment variable.  It also
exposes a ready‑to‑use ``logger`` instance configured according to the
selected configuration.

Typical usage::

    from config import get_config, logger

    cfg = get_config()
    logger.info("Application started in %s mode", cfg.ENV)

The implementation relies only on the Python standard library so that it
remains lightweight and easy to test.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Mapping, Optional

# --------------------------------------------------------------------------- #
# Configuration data structures
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class BaseConfig:
    """
    Base configuration shared by all environments.

    Attributes
    ----------
    ENV: str
        Human readable name of the environment (e.g. ``development``).
    DEBUG: bool
        Enable/disable debug mode.
    TESTING: bool
        Enable/disable testing mode.
    DATABASE_URL: str
        URL used by the data layer.  Defaults to an SQLite file in the project
        root for local development.
    LOG_LEVEL: int
        Logging level used by the default logger.
    LOG_FORMAT: str
        Format string for log messages.
    LOG_FILE: Optional[Path]
        Optional file path for log output.  If ``None`` logs go to ``stderr``.
    STATIC_ROOT: Path
        Directory that holds static assets (used by the web UI).
    TEMPLATE_ROOT: Path
        Directory that holds HTML templates.
    """

    ENV: str = "base"
    DEBUG: bool = False
    TESTING: bool = False
    DATABASE_URL: str = "sqlite:///./data.db"
    LOG_LEVEL: int = logging.INFO
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[Path] = None
    STATIC_ROOT: Path = field(default_factory=lambda: Path(__file__).parent / "static")
    TEMPLATE_ROOT: Path = field(default_factory=lambda: Path(__file__).parent / "templates")

    @classmethod
    def from_env(cls) -> "BaseConfig":
        """
        Create a configuration instance populated from environment variables.
        Only variables that are explicitly defined in the subclass are read.
        """
        env_vars: Mapping[str, Any] = {
            "ENV": os.getenv("APP_ENV", cls.ENV),
            "DEBUG": os.getenv("APP_DEBUG", str(cls.DEBUG)).lower() in ("1", "true", "yes"),
            "TESTING": os.getenv("APP_TESTING", str(cls.TESTING)).lower() in ("1", "true", "yes"),
            "DATABASE_URL": os.getenv("DATABASE_URL", cls.DATABASE_URL),
            "LOG_LEVEL": getattr(logging, os.getenv("LOG_LEVEL", "").upper(), cls.LOG_LEVEL),
            "LOG_FILE": Path(os.getenv("LOG_FILE")) if os.getenv("LOG_FILE") else cls.LOG_FILE,
            "STATIC_ROOT": Path(os.getenv("STATIC_ROOT", cls.STATIC_ROOT)),
            "TEMPLATE_ROOT": Path(os.getenv("TEMPLATE_ROOT", cls.TEMPLATE_ROOT)),
        }

        # Filter out any keys that the subclass does not accept
        field_names = {f.name for f in cls.__dataclass_fields__.values()}
        filtered = {k: v for k, v in env_vars.items() if k in field_names}
        return cls(**filtered)  # type: ignore[arg-type]


@dataclass(frozen=True)
class DevelopmentConfig(BaseConfig):
    """Configuration tuned for local development."""

    ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: int = logging.DEBUG
    DATABASE_URL: str = "sqlite:///./dev_data.db"


@dataclass(frozen=True)
class TestingConfig(BaseConfig):
    """Configuration used when running the test suite."""

    ENV: str = "testing"
    DEBUG: bool = True
    TESTING: bool = True
    LOG_LEVEL: int = logging.DEBUG
    DATABASE_URL: str = "sqlite:///./test_data.db"


@dataclass(frozen=True)
class ProductionConfig(BaseConfig):
    """Configuration for production deployments."""

    ENV: str = "production"
    DEBUG: bool = False
    LOG_LEVEL: int = logging.WARNING
    # In production the database URL must be supplied via env var
    DATABASE_URL: str = field(default_factory=lambda: os.getenv("DATABASE_URL", ""))


# --------------------------------------------------------------------------- #
# Helper functions
# --------------------------------------------------------------------------- #


def get_config() -> BaseConfig:
    """
    Resolve and return the appropriate configuration instance.

    The environment variable ``CONFIG_ENV`` determines which subclass is used.
    Accepted values are ``development``, ``testing`` and ``production``.
    If the variable is missing or contains an unknown value, ``DevelopmentConfig``
    is used as a safe default.

    Returns
    -------
    BaseConfig
        An immutable configuration object.
    """
    env = os.getenv("CONFIG_ENV", "development").lower()
    config_cls: type[BaseConfig]

    if env == "production":
        config_cls = ProductionConfig
    elif env == "testing":
        config_cls = TestingConfig
    else:
        config_cls = DevelopmentConfig

    return config_cls.from_env()


def _configure_logging(cfg: BaseConfig) -> None:
    """
    Apply logging configuration based on the supplied ``BaseConfig`` instance.

    Parameters
    ----------
    cfg : BaseConfig
        The configuration object containing logging preferences.
    """
    handlers: list[logging.Handler] = []

    # Console handler (stderr)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(cfg.LOG_LEVEL)
    console_handler.setFormatter(logging.Formatter(cfg.LOG_FORMAT))
    handlers.append(console_handler)

    # Optional file handler
    if cfg.LOG_FILE:
        file_handler = logging.FileHandler(cfg.LOG_FILE, encoding="utf-8")
        file_handler.setLevel(cfg.LOG_LEVEL)
        file_handler.setFormatter(logging.Formatter(cfg.LOG_FORMAT))
        handlers.append(file_handler)

    logging.basicConfig(level=cfg.LOG_LEVEL, handlers=handlers)


# --------------------------------------------------------------------------- #
# Public objects
# --------------------------------------------------------------------------- #

# Resolve configuration at import time – this is cheap and ensures a single
# source of truth throughout the process.
config: BaseConfig = get_config()
_configured = False

def _ensure_logging_configured() -> None:
    """Idempotent wrapper to guarantee logging is configured exactly once."""
    global _configured
    if not _configured:
        _configure_logging(config)
        _configured = True

# Expose a ready‑to‑use logger for the rest of the codebase.
_ensure_logging_configured()
logger: logging.Logger = logging.getLogger(__name__)

__all__ = [
    "BaseConfig",
    "DevelopmentConfig",
    "TestingConfig",
    "ProductionConfig",
    "get_config",
    "config",
    "logger",
]