"""
app.__init__
~~~~~~~~~~~~

Factory module for creating the Flask application instance.

The :func:`create_app` function configures the Flask app, registers the
``calculator_bp`` blueprint and returns the ready‑to‑run application object.

This module is deliberately lightweight – it contains no route logic, only
application bootstrapping.  It is imported by ``run.py`` and can also be used
by external tools (e.g., test suites) to obtain an isolated app instance.
"""

from __future__ import annotations

import logging
import os
from typing import Final

from flask import Flask

# Local imports – the blueprint that provides the calculator routes.
from .routes import calculator_bp

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #

LOGGER_NAME: Final = "app_factory"
logger = logging.getLogger(LOGGER_NAME)
if not logger.handlers:
    # Configure a simple console logger if the application hasn't set one up yet.
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def _configure_app(app: Flask) -> None:
    """
    Apply default configuration values to the Flask app.

    The function isolates configuration logic so that ``create_app`` stays
    readable and testable.

    Parameters
    ----------
    app: Flask
        The Flask instance to configure.
    """
    # Secret key – use an environment variable for production, otherwise a
    # deterministic fallback suitable for development/testing.
    secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
    app.config["SECRET_KEY"] = secret_key

    # Example placeholder for future configuration values.
    # app.config.from_mapping(
    #     DEBUG=os.getenv("FLASK_DEBUG", "0") == "1",
    #     # Add more config keys here.
    # )
    logger.debug("Application configuration applied (SECRET_KEY hidden).")


def _register_blueprints(app: Flask) -> None:
    """
    Register all blueprints with the Flask application.

    Currently only the ``calculator_bp`` blueprint is registered, but the
    function is written to be easily extensible.

    Parameters
    ----------
    app: Flask
        The Flask instance to which blueprints will be attached.

    Raises
    ------
    RuntimeError
        If the blueprint registration fails for any reason.
    """
    try:
        app.register_blueprint(calculator_bp, url_prefix="/")
        logger.info("Blueprint 'calculator_bp' registered with url_prefix='/'")
    except Exception as exc:  # pragma: no cover – defensive programming
        logger.exception("Failed to register blueprint 'calculator_bp'")
        raise RuntimeError(
            "Unable to register the calculator blueprint. See logs for details."
        ) from exc


def create_app() -> Flask:
    """
    Application factory.

    Returns
    -------
    Flask
        A fully configured Flask application instance ready to be run.

    Notes
    -----
    The factory pattern enables the creation of multiple independent app
    instances (useful for testing) and postpones heavy imports until the
    function is called.
    """
    logger.info("Creating Flask application instance.")
    app = Flask(__name__, instance_relative_config=False)

    _configure_app(app)

    _register_blueprints(app)

    logger.info("Flask application created successfully.")
    return app


# Export the public API of this module.
__all__ = ["create_app"]