"""
src.__init__
==============

Application factory for the Flask project.

The factory creates a :class:`flask.Flask` instance, loads configuration
from :mod:`src.config`, registers the main blueprint defined in
:mod:`src.routes`, and installs generic error handlers.

The function is deliberately lightweight and side‑effect free – it does
not start the server or perform any I/O beyond importing modules.
"""

from __future__ import annotations

import logging
from typing import Any

from flask import Flask, jsonify

# Local imports – these modules are part of the same package.
# ``CONFIG`` is expected to be a mapping compatible with ``app.config.update``.
# ``blueprint`` is the Flask :class:`~flask.Blueprint` that contains the
# application routes.
try:
    from .config import CONFIG  # type: ignore
except Exception as exc:  # pragma: no cover
    raise ImportError("Failed to import CONFIG from src.config") from exc

try:
    from .routes import blueprint as routes_blueprint  # type: ignore
except Exception as exc:  # pragma: no cover
    raise ImportError("Failed to import 'blueprint' from src.routes") from exc


logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())


def _register_error_handlers(app: Flask) -> None:
    """Register generic JSON error handlers for the application.

    Parameters
    ----------
    app: Flask
        The Flask application instance to which the handlers are attached.
    """

    @app.errorhandler(404)
    def not_found(error: Any):
        """Return a JSON payload for 404 errors."""
        logger.debug("404 Not Found: %s", error)
        response = jsonify(
            {
                "error": "Not Found",
                "message": "The requested URL was not found on the server.",
            }
        )
        response.status_code = 404
        return response

    @app.errorhandler(500)
    def internal_error(error: Any):
        """Return a JSON payload for 500 errors."""
        logger.exception("Internal server error: %s", error)
        response = jsonify(
            {
                "error": "Internal Server Error",
                "message": "An unexpected error occurred.",
            }
        )
        response.status_code = 500
        return response


def create_app() -> Flask:
    """
    Application factory.

    The function follows the classic Flask application‑factory pattern:
    it creates a :class:`flask.Flask` instance, loads configuration,
    registers blueprints, and sets up error handling.

    Returns
    -------
    Flask
        Configured Flask application ready to be run or used in tests.
    """
    logger.info("Creating Flask application instance")
    app = Flask(__name__, instance_relative_config=False)

    # Load configuration from the central CONFIG mapping.
    if not isinstance(CONFIG, dict):
        raise TypeError("CONFIG must be a dictionary-like object")
    app.config.update(CONFIG)
    logger.debug("Application configuration loaded: %s", {k: v for k, v in app.config.items() if k.isupper()})

    # Register the main blueprint that contains the routes.
    try:
        app.register_blueprint(routes_blueprint)
        logger.info("Blueprint %s registered successfully", routes_blueprint.name)
    except Exception as exc:  # pragma: no cover
        logger.exception("Failed to register blueprint %s", routes_blueprint)
        # Propagate the exception as required by the specification.
        raise

    # Install generic error handlers.
    _register_error_handlers(app)

    logger.info("Flask application creation complete")
    return app


__all__ = ["create_app"]