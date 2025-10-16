"""Configuration module for the Flask application.

This module loads environment variables from a `.env` file (if present) and
provides a `Config` class with sensible defaults for common Flask settings.
"""

import logging
import os
from typing import Final

from dotenv import load_dotenv

# Load environment variables from a .env file located in the project root.
# If the file does not exist, `load_dotenv` silently does nothing.
load_dotenv()

# Configure module‑level logger.
logger = logging.getLogger(__name__)
if not logger.handlers:
    # Prevent adding multiple handlers if the application configures logging elsewhere.
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class Config:
    """Central configuration holder for Flask.

    Attributes:
        FLASK_ENV (str): The Flask environment (e.g., ``development`` or ``production``).
        SECRET_KEY (str): Secret key used by Flask for session signing and CSRF protection.
        DEBUG (bool): Flag indicating whether Flask should run in debug mode.
    """

    # Class attributes are defined as type‑annotated constants.
    FLASK_ENV: Final[str] = os.getenv("FLASK_ENV", "development")
    SECRET_KEY: Final[str] = os.getenv(
        "SECRET_KEY", os.urandom(24).hex()
    )  # Generate a random key if none provided.
    DEBUG: Final[bool] = (
        os.getenv("DEBUG", "True" if FLASK_ENV == "development" else "False")
        .lower()
        .strip()
        in {"true", "1", "yes"}
    )

    def __init__(self) -> None:
        """Prevent instantiation; this class is intended to be used via its attributes."""
        raise TypeError("Config is a static class and cannot be instantiated.")

    @classmethod
    def as_dict(cls) -> dict:
        """Return the configuration as a dictionary suitable for Flask's ``app.config``.

        Returns:
            dict: Mapping of configuration keys to their values.
        """
        config_dict = {
            "FLASK_ENV": cls.FLASK_ENV,
            "SECRET_KEY": cls.SECRET_KEY,
            "DEBUG": cls.DEBUG,
        }
        logger.debug("Generated configuration dictionary: %s", config_dict)
        return config_dict

    @classmethod
    def reload(cls) -> None:
        """Reload environment variables and update class attributes.

        This method re‑reads the `.env` file and updates the configuration
        values. It is useful in testing scenarios where environment variables
        may change between test runs.
        """
        load_dotenv(override=True)
        # Update class attributes dynamically.
        cls.FLASK_ENV = os.getenv("FLASK_ENV", "development")
        cls.SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(24).hex())
        cls.DEBUG = (
            os.getenv("DEBUG", "True" if cls.FLASK_ENV == "development" else "False")
            .lower()
            .strip()
            in {"true", "1", "yes"}
        )
        logger.info("Configuration reloaded: FLASK_ENV=%s, DEBUG=%s", cls.FLASK_ENV, cls.DEBUG)