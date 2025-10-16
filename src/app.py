import logging
import os
from flask import Flask
from src.routes import calculator_bp


def _load_secret_key() -> str:
    """Load the Flask secret key from the environment.

    Returns:
        str: The secret key.

    Raises:
        RuntimeError: If the ``SECRET_KEY`` environment variable is not set.
    """
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise RuntimeError(
            "Missing required environment variable: SECRET_KEY"
        )
    return secret_key


def _configure_logging() -> None:
    """Configure the root logger for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    # Suppress overly verbose logs from Flask's internal logger in production
    logging.getLogger("werkzeug").setLevel(logging.WARNING)


def create_app() -> Flask:
    """Create and configure the Flask application instance.

    The function performs the following steps:
    1. Instantiates a Flask app with the current module name.
    2. Loads configuration values (e.g., ``SECRET_KEY``) from environment
       variables, applying sensible defaults where appropriate.
    3. Registers the calculator blueprint under the ``/api`` URL prefix.
    4. Returns the fully configured Flask app.

    Returns:
        Flask: The configured Flask application.

    Raises:
        RuntimeError: If required environment variables are missing.
    """
    _configure_logging()
    logger = logging.getLogger(__name__)

    logger.debug("Instantiating Flask application.")
    app = Flask(__name__)

    # Load essential configuration
    logger.debug("Loading configuration from environment.")
    app.config["SECRET_KEY"] = _load_secret_key()
    app.config["ENV"] = os.getenv("FLASK_ENV", "production")
    app.config["DEBUG"] = app.config["ENV"] == "development"

    # Register blueprints
    logger.info("Registering calculator blueprint under '/api'.")
    app.register_blueprint(calculator_bp, url_prefix="/api")

    logger.info("Flask application created successfully.")
    return app