"""
config.py
---------

Central configuration module for the Flask application.

- Loads environment variables from a `.env` file (if present) using
  `python-dotenv`.
- Provides a `load_config` function that returns a dictionary with the
  essential Flask settings: ``FLASK_ENV``, ``SECRET_KEY`` and ``DEBUG``.
- Exposes a module‑level ``CONFIG`` constant that can be imported by the
  application factory (e.g. ``src/app.py``).

The module raises a ``RuntimeError`` if the mandatory ``SECRET_KEY`` is not
defined, ensuring the application cannot start with an insecure configuration.
"""

from __future__ import annotations

import logging
import os
from typing import Dict

from dotenv import load_dotenv

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
logger = logging.getLogger(__name__)
if not logger.handlers:
    # Configure a simple console logger if the application hasn't configured logging yet.
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# --------------------------------------------------------------------------- #
# Helper utilities
# --------------------------------------------------------------------------- #
def _str_to_bool(value: str | None) -> bool:
    """
    Convert common string representations of truthy/falsy values to ``bool``.

    Parameters
    ----------
    value: str | None
        The raw string value from the environment.

    Returns
    -------
    bool
        ``True`` for typical truthy strings (e.g. "1", "true", "yes").
        ``False`` otherwise (including ``None``).
    """
    if not value:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def load_config() -> Dict[str, object]:
    """
    Load configuration from the environment (optionally via a ``.env`` file).

    The function reads the following variables:

    - ``FLASK_ENV`` – The Flask environment name (defaults to ``"production"``).
    - ``SECRET_KEY`` – Secret key used by Flask for sessions and CSRF protection.
      This variable is **required**; a missing value raises ``RuntimeError``.
    - ``DEBUG`` – Optional explicit debug flag. If omitted, ``DEBUG`` is inferred
      from ``FLASK_ENV`` (debug mode is enabled when ``FLASK_ENV`` is not
      ``"production"``).

    Returns
    -------
    dict
        Mapping with keys ``FLASK_ENV``, ``SECRET_KEY`` and ``DEBUG`` ready to be
        passed to ``app.config.update``.

    Raises
    ------
    RuntimeError
        If ``SECRET_KEY`` is not defined or is an empty string.
    """
    # Load .env file if present; ``load_dotenv`` silently ignores missing files.
    load_dotenv()
    logger.debug("Loaded environment variables from .env (if present).")

    flask_env = os.getenv("FLASK_ENV", "production")
    secret_key = os.getenv("SECRET_KEY")
    debug_raw = os.getenv("DEBUG")

    if not secret_key:
        message = (
            "Configuration error: the environment variable 'SECRET_KEY' is required "
            "but was not found. Set it in the .env file or the execution environment."
        )
        logger.error(message)
        raise RuntimeError(message)

    # Determine DEBUG flag: explicit env var overrides inference from FLASK_ENV.
    if debug_raw is not None:
        debug = _str_to_bool(debug_raw)
        logger.debug("DEBUG flag read from environment: %s -> %s", debug_raw, debug)
    else:
        debug = flask_env.lower() != "production"
        logger.debug(
            "DEBUG flag inferred from FLASK_ENV='%s': %s", flask_env, debug
        )

    config: Dict[str, object] = {
        "FLASK_ENV": flask_env,
        "SECRET_KEY": secret_key,
        "DEBUG": debug,
    }

    logger.info(
        "Configuration loaded: FLASK_ENV=%s, DEBUG=%s", flask_env, debug
    )
    return config


# Load configuration at import time so other modules can simply import CONFIG.
CONFIG: Dict[str, object] = load_config()

__all__ = ["load_config", "CONFIG"]