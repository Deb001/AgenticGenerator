"""
config.py
~~~~~~~~~~

Production‑ready configuration module for the application.

This module uses :class:`pydantic.BaseSettings` to load configuration from
environment variables (or a ``.env`` file) and provides a singleton
``Config`` instance that can be imported anywhere in the codebase.
It also exposes a helper ``get_logger`` function that returns a
pre‑configured :class:`logging.Logger` instance.

Typical usage:

    from config import config, get_logger

    logger = get_logger()
    logger.info(f"Application started: {config.APP_NAME}")

The configuration values are type‑checked at import time, and missing
required variables raise a clear error.  The module is fully typed,
well documented, and ready for deployment in a Docker or cloud
environment.

"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

from pydantic import BaseSettings, Field, ValidationError, validator

# --------------------------------------------------------------------------- #
# Settings model
# --------------------------------------------------------------------------- #


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Attributes
    ----------
    APP_NAME : str
        Human‑readable name of the application.
    DEBUG : bool
        Flag to enable debug mode.
    DATABASE_URL : str
        Connection string for the database.
    SECRET_KEY : str
        Secret key used for cryptographic operations.
    LOG_LEVEL : str
        Logging level (e.g. ``"INFO"``, ``"DEBUG"``, ``"WARNING"``).
    ENVIRONMENT : str
        Deployment environment (``"development"``, ``"staging"``, ``"production"``).
    """

    APP_NAME: str = Field(..., env="APP_NAME")
    DEBUG: bool = Field(False, env="DEBUG")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")

    @validator("LOG_LEVEL")
    def _validate_log_level(cls, value: str) -> str:
        """Ensure the log level is a valid logging level."""
        valid_levels = {"CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG", "NOTSET"}
        upper = value.upper()
        if upper not in valid_levels:
            raise ValueError(f"Invalid LOG_LEVEL: {value!r}. Must be one of {valid_levels}.")
        return upper

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# --------------------------------------------------------------------------- #
# Singleton configuration instance
# --------------------------------------------------------------------------- #


class Config:
    """
    Singleton wrapper around :class:`Settings`.

    The instance is created lazily on first import and cached for
    subsequent accesses.  This pattern ensures that configuration is
    loaded only once and is thread‑safe for typical use cases.

    Example
    -------
    >>> from config import config
    >>> config.APP_NAME
    'MyApp'
    """

    _instance: Optional[Settings] = None

    def __new__(cls) -> Settings:
        if cls._instance is None:
            try:
                cls._instance = Settings()
            except ValidationError as exc:
                # Provide a clear error message pointing to the missing
                # environment variable(s) and exit the process.
                missing = ", ".join([e["loc"][0] for e in exc.errors()])
                raise RuntimeError(
                    f"Missing required configuration values: {missing}"
                ) from exc
        return cls._instance


# Create a module‑level singleton instance that can be imported
config: Settings = Config()


# --------------------------------------------------------------------------- #
# Logging helper
# --------------------------------------------------------------------------- #


def get_logger(name: str = __name__) -> logging.Logger:
    """
    Return a logger configured according to the application settings.

    Parameters
    ----------
    name : str, optional
        Name of the logger. Defaults to the module name.

    Returns
    -------
    logging.Logger
        Configured logger instance.
    """
    logger = logging.getLogger(name)

    # Avoid adding multiple handlers if get_logger is called repeatedly.
    if logger.handlers:
        return logger

    logger.setLevel(config.LOG_LEVEL)

    # Create console handler with a simple format.
    console_handler = logging.StreamHandler()
    console_handler.setLevel(config.LOG_LEVEL)

    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    # Optional: add file handler in production environments.
    if config.ENVIRONMENT == "production":
        log_file = Path("logs") / f"{config.APP_NAME}.log"
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(config.LOG_LEVEL)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger