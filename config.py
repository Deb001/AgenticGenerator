# config.py
"""
Centralized configuration settings for the Flask application.

This module defines a :class:`Config` base class and environment-specific
subclasses.  The configuration is loaded from environment variables with sane
defaults, making the application suitable for both development and production.
"""

import os
import logging
from dataclasses import dataclass, field

# Configure module-level logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(module)s:%(lineno)d - %(message)s",
)

def _get_env_variable(name: str, default: str | None = None) -> str:
    """
    Retrieve an environment variable or return a default value.

    Parameters
    ----------
    name : str
        The name of the environment variable.
    default : str | None, optional
        Default value if the variable is not set.

    Returns
    -------
    str
        The resolved environment variable value.
    """
    try:
        return os.environ[name]
    except KeyError as exc:
        if default is None:
            logger.error(f"Required environment variable '{name}' not set.")
            raise RuntimeError(
                f"Missing required configuration: {name}"
            ) from exc
        logger.warning(f"Environment variable '{name}' not set. Using default.")
        return default


@dataclass
class Config:
    """
    Base configuration class.

    Attributes
    ----------
    DEBUG : bool
        Enable or disable debug mode.
    SECRET_KEY : str
        Secret key for session management and CSRF protection.
    DATABASE_URI : str
        Database connection string (optional).
    """

    DEBUG: bool = field(default_factory=lambda: _get_env_variable("FLASK_DEBUG", "0") == "1")
    SECRET_KEY: str = field(default_factory=lambda: _get_env_variable("SECRET_KEY", "dev-secret-key"))
    DATABASE_URI: str | None = field(default_factory=lambda: _get_env_variable("DATABASE_URL", None))

    @classmethod
    def from_env(cls):
        """
        Create a configuration instance based on the FLASK_ENV environment variable.

        Returns
        -------
        Config
            An instance of :class:`Config` or one of its subclasses.
        """
        env = _get_env_variable("FLASK_ENV", "production").lower()
        if env == "development":
            return DevelopmentConfig()
        elif env == "testing":
            return TestingConfig()
        else:
            return ProductionConfig()


class DevelopmentConfig(Config):
    """
    Configuration for development environment.

    Enables debug mode and uses a local SQLite database by default.
    """
    DEBUG: bool = True
    DATABASE_URI: str | None = field(default_factory=lambda: _get_env_variable("DEV_DATABASE_URL", "sqlite:///dev.db"))


class TestingConfig(Config):
    """
    Configuration for testing environment.

    Uses an in-memory SQLite database and disables CSRF protection.
    """
    DEBUG: bool = False
    DATABASE_URI: str | None = field(default_factory=lambda: "sqlite:///:memory:")
    TESTING: bool = True
    WTF_CSRF_ENABLED: bool = False


class ProductionConfig(Config):
    """
    Configuration for production environment.

    Debug mode is disabled and a secure secret key must be provided.
    """
    DEBUG: bool = False
    # SECRET_KEY should be set via environment variable; no default to enforce security.
    @property
    def SECRET_KEY(self):
        return _get_env_variable("SECRET_KEY")


# Expose the active configuration
config = Config.from_env()