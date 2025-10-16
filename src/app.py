"""
src/app.py
-----------

Application factory for the Primitive Calculator Flask service.

Creates a Flask instance, loads configuration from environment variables,
registers the API blueprint, and configures basic logging.

The module can also be executed directly (e.g. via `python -m src.app`) which
starts the development server. In production the `create_app` function is
imported by the WSGI server (Gunicorn, uWSGI, etc.).
"""

from __future__ import annotations

import os
import logging
from typing import Optional

from flask import Flask
from src.routes import api_bp

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
LOGGER_NAME = "calculator_app"
logger = logging.getLogger(LOGGER_NAME)
if not logger.handlers:
    # Configure a simple console logger if none exists.
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    logger.setLevel(logging.INFO)


def _str_to_bool(value: Optional[str]) -> bool:
    """
    Convert common string representations of booleans to ``bool``.
    Returns ``False`` for ``None`` or unrecognised values.
    """
    if not value:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


def create_app() -> Flask:
    """
    Application factory.

    - Instantiates the Flask app.
    - Loads configuration from environment variables:
        * ``SECRET_KEY`` – required in production.
        * ``DEBUG`` – optional, defaults to ``False``.
    - Registers the ``api_bp`` blueprint under the ``/api`` prefix.
    - Returns the configured Flask instance.

    Raises:
        RuntimeError: If ``SECRET_KEY`` is missing while the app is not in
            debug mode (i.e., presumed production).
    """
    app = Flask(__name__, instance_relative_config=False)

    # ------------------------------------------------------------------- #
    # Configuration
    # ------------------------------------------------------------------- #
    debug = _str_to_bool(os.getenv("DEBUG"))
    app.config["DEBUG"] = debug

    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        if not debug:
            # In production a secret key is mandatory for session security.
            logger.error("Missing SECRET_KEY environment variable in production mode.")
            raise RuntimeError("SECRET_KEY environment variable must be set in production.")
        else:
            # In debug mode Flask will generate a temporary key if none is set.
            logger.warning(
                "SECRET_KEY not set; using Flask's default insecure key (debug mode only)."
            )
    else:
        app.config["SECRET_KEY"] = secret_key

    # ------------------------------------------------------------------- #
    # Blueprint registration
    # ------------------------------------------------------------------- #
    app.register_blueprint(api_bp, url_prefix="/api")
    logger.info("Registered blueprint 'api_bp' with URL prefix '/api'.")

    # ------------------------------------------------------------------- #
    # Additional production‑ready tweaks can be added here (e.g., CORS,
    # error handlers, request logging, etc.).
    # ------------------------------------------------------------------- #

    return app


# --------------------------------------------------------------------------- #
# When executed directly, run the development server.
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    # Use the factory to create the app instance.
    flask_app = create_app()

    # Port can be overridden via the PORT environment variable.
    port = int(os.getenv("PORT", "5000"))
    host = os.getenv("HOST", "0.0.0.0")

    logger.info(f"Starting Flask app on http://{host}:{port} (debug={flask_app.config['DEBUG']})")
    flask_app.run(host=host, port=port, debug=flask_app.config["DEBUG"])