"""Flask application factory for the calculator service.

The :func:`create_app` function follows the Flask application factory pattern.
It creates a :class:`flask.Flask` instance, loads configuration from the
:class:`app.config.Config` class, registers the calculator blueprint defined in
:mod:`app.routes`, and returns the configured app.

Typical usage::

    from app import create_app

    app = create_app()
    app.run(host="0.0.0.0", port=5000)
"""

from __future__ import annotations

import logging
from typing import Final

from flask import Flask

from .config import Config
from .routes import calculator_bp

__all__: Final = ["create_app"]


def _configure_logging() -> None:
    """Configure the root logger for the application.

    The configuration is intentionally minimal; it can be overridden by the
    Flask app's logger configuration if needed.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


def create_app() -> Flask:
    """Create and configure a Flask application instance.

    Returns
    -------
    Flask
        A fully configured Flask application with the calculator blueprint
        registered.

    Raises
    ------
    RuntimeError
        If loading the configuration from :class:`app.config.Config` fails.
    """
    _configure_logging()
    logger = logging.getLogger(__name__)

    try:
        app = Flask(__name__)
        # Load configuration from the Config class.
        app.config.from_object(Config)
        logger.info("Configuration loaded from %s", Config.__name__)
    except Exception as exc:  # pragma: no cover
        # Catch any unexpected exception during configuration loading.
        logger.exception("Failed to load configuration.")
        raise RuntimeError("Failed to load application configuration.") from exc

    # Register blueprints.
    app.register_blueprint(calculator_bp)
    logger.info("Registered blueprint: %s", calculator_bp.name)

    return app