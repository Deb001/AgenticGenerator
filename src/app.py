import logging
import os

from flask import Flask, jsonify
from dotenv import load_dotenv

from src.routes import calculator_bp


def _configure_logging() -> None:
    """Configure the root logger for the application.

    Sets a basic configuration with INFO level and a concise format.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def create_app() -> Flask:
    """Create and configure the Flask application.

    This function performs the following steps:
    1. Load environment variables from a `.env` file.
    2. Initialise the Flask app instance.
    3. Apply configuration values (e.g., ``SECRET_KEY``).
    4. Register the calculator blueprint.
    5. Set up generic JSON error handlers for 404 and 500 responses.
    6. Configure application‑wide logging.

    Returns:
        Flask: The configured Flask application instance.
    """
    # Load environment variables early so configuration can use them.
    load_dotenv()

    # Configure logging before any other operation.
    _configure_logging()
    logger = logging.getLogger(__name__)
    logger.info("Creating Flask application instance.")

    app = Flask(__name__)

    # Application configuration.
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        logger.warning("SECRET_KEY not set in environment; using default insecure key.")
        secret_key = "default-insecure-secret"
    app.config["SECRET_KEY"] = secret_key

    # Register blueprints.
    app.register_blueprint(calculator_bp)
    logger.info("Registered calculator blueprint.")

    # Error handlers.
    @app.errorhandler(404)
    def handle_not_found(error):
        """Return JSON response for 404 Not Found errors."""
        logger.debug("404 Not Found: %s", error)
        response = jsonify(
            {
                "error": "Not Found",
                "message": "The requested resource could not be found.",
            }
        )
        response.status_code = 404
        return response

    @app.errorhandler(500)
    def handle_internal_error(error):
        """Return JSON response for 500 Internal Server errors."""
        logger.exception("500 Internal Server Error: %s", error)
        response = jsonify(
            {
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Please try again later.",
            }
        )
        response.status_code = 500
        return response

    return app