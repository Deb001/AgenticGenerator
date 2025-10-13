"""
config.py
---------

Central configuration module for the Flask based calculator application.

The module defines a hierarchy of configuration classes that can be
selected at runtime via the ``APP_ENV`` environment variable (or an
explicit argument to :func:`load_config`).  Each configuration class
provides sensible defaults and pulls values from environment variables
where appropriate, making the application easy to configure in
different deployment scenarios (development, testing, production).

The module also offers a small helper to initialise Flask applications
and to configure a robust logging setup.

Typical usage in ``main.py``::

    from flask import Flask
    from config import load_config, configure_logging

    app = Flask(__name__, static_folder=config.STATIC_FOLDER,
                template_folder=config.TEMPLATE_FOLDER)

    config = load_config()
    config.init_app(app)
    configure_logging(config)

    # register routes / blueprints …
    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=5000)
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping, Optional, Type


def _env_bool(key: str, default: bool = False) -> bool:
    """Read a boolean value from the environment.

    Accepts ``"1"``, ``"true"``, ``"yes"`` (case‑insensitive) as truthy.
    """
    val = os.getenv(key)
    if val is None:
        return default
    return val.lower() in {"1", "true", "yes", "on"}


def _env_path(key: str, default: Path) -> Path:
    """Read a filesystem path from the environment, expanding user/home."""
    val = os.getenv(key)
    if not val:
        return default
    return Path(val).expanduser().resolve()


@dataclass
class BaseConfig:
    """
    Base configuration shared by all environments.

    Attributes are deliberately typed and have defaults that work for a
    typical local development setup.  Sub‑classes override where needed.
    """

    # Core Flask settings
    DEBUG: bool = False
    TESTING: bool = False
    SECRET_KEY: str = field(default_factory=lambda: os.getenv("SECRET_KEY", "change-me"))

    # Paths – resolved to absolute ``Path`` objects for safety
    STATIC_FOLDER: Path = field(
        default_factory=lambda: _env_path(
            "STATIC_FOLDER", Path(__file__).parent.parent / "static"
        )
    )
    TEMPLATE_FOLDER: Path = field(
        default_factory=lambda: _env_path(
            "TEMPLATE_FOLDER", Path(__file__).parent.parent / "templates"
        )
    )

    # Logging configuration
    LOG_LEVEL: int = field(default_factory=lambda: logging.INFO)
    LOG_FORMAT: str = "%(asctime)s %(levelname)s %(name)s %(message)s"
    LOG_FILE: Optional[Path] = None  # If set, a file handler will be added

    # Miscellaneous
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SAMESITE: str = "Lax"

    def init_app(self, app: Any) -> None:
        """
        Apply configuration values to a Flask app instance.

        ``app`` is expected to be a Flask application, but the function
        deliberately avoids importing Flask at module import time to keep
        this file lightweight and testable.
        """
        # Direct attribute assignment works for both Flask and objects that
        # mimic its config interface.
        for key in self.__dataclass_fields__:  # type: ignore[attr-defined]
            setattr(app, key, getattr(self, key))


@dataclass
class DevelopmentConfig(BaseConfig):
    """Configuration tuned for local development."""

    DEBUG: bool = True
    LOG_LEVEL: int = logging.DEBUG
    SECRET_KEY: str = field(default_factory=lambda: os.getenv("SECRET_KEY", "dev-secret-key"))


@dataclass
class TestingConfig(BaseConfig):
    """Configuration used when running the test suite."""

    TESTING: bool = True
    DEBUG: bool = True
    LOG_LEVEL: int = logging.DEBUG
    SECRET_KEY: str = "test-secret-key"


@dataclass
class ProductionConfig(BaseConfig):
    """Configuration for production deployments."""

    DEBUG: bool = False
    LOG_LEVEL: int = logging.WARNING
    # In production we *require* a secret key to be set via env var.
    SECRET_KEY: str = field(default_factory=lambda: os.getenv("SECRET_KEY") or
                            (_raise_missing_secret_key()))


def _raise_missing_secret_key() -> str:
    """Helper that raises a clear error when SECRET_KEY is absent in prod."""
    raise RuntimeError(
        "SECRET_KEY environment variable must be set in production. "
        "Generate a strong random value and export it before starting the app."
    )


# Mapping from environment name to config class
_ENV_CONFIG_MAP: Mapping[str, Type[BaseConfig]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def load_config(env: Optional[str] = None) -> BaseConfig:
    """
    Load the appropriate configuration class based on the ``APP_ENV``
    environment variable or an explicit ``env`` argument.

    Parameters
    ----------
    env :
        Optional explicit environment name.  If omitted, the function
        reads ``APP_ENV`` and defaults to ``"development"`` when the
        variable is not set.

    Returns
    -------
    BaseConfig
        An instantiated configuration object ready to be used.
    """
    env_name = (env or os.getenv("APP_ENV", "development")).lower()
    config_cls = _ENV_CONFIG_MAP.get(env_name)
    if config_cls is None:
        raise ValueError(
            f"Unsupported APP_ENV '{env_name}'. "
            f"Supported values are: {', '.join(_ENV_CONFIG_MAP)}."
        )
    return config_cls()


def configure_logging(config: BaseConfig) -> None:
    """
    Configure the root logger according to the supplied configuration.

    This function sets up a stream handler (stderr) and, if ``config.LOG_FILE``
    is defined, an additional rotating file handler.

    The function is idempotent – calling it multiple times will not add
    duplicate handlers.
    """
    logger = logging.getLogger()
    logger.setLevel(config.LOG_LEVEL)

    # Avoid adding duplicate handlers on repeated calls
    if any(isinstance(h, logging.StreamHandler) for h in logger.handlers):
        return

    formatter = logging.Formatter(config.LOG_FORMAT)

    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(config.LOG_LEVEL)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    if config.LOG_FILE:
        from logging.handlers import RotatingFileHandler

        log_path = config.LOG_FILE.expanduser().resolve()
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = RotatingFileHandler(
            filename=str(log_path),
            maxBytes=10 * 1024 * 1024,  # 10 MiB
            backupCount=5,
            encoding="utf-8",
        )
        file_handler.setLevel(config.LOG_LEVEL)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)


__all__ = [
    "BaseConfig",
    "DevelopmentConfig",
    "TestingConfig",
    "ProductionConfig",
    "load_config",
    "configure_logging",
]