"""
main.py - Application entry point.

This module creates and runs a Flask web application that serves the static
frontend assets (HTML, CSS, JavaScript) for the calculator project.  It also
exposes a simple health‑check endpoint and configures structured logging.

The configuration values are loaded from :pymod:`config`.  If a setting is not
present, sensible defaults are used.

Typical usage::
    $ python -m main
"""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict

from flask import Flask, send_from_directory, jsonify

# --------------------------------------------------------------------------- #
# Configuration handling
# --------------------------------------------------------------------------- #
try:
    # Import user‑defined configuration.  The file may not exist in every
    # environment; we fall back to defaults.
    import config  # type: ignore
except Exception as exc:  # pragma: no cover
    # If config cannot be imported, create a dummy module with defaults.
    logging.basicConfig(level=logging.WARNING)
    logging.getLogger(__name__).warning(
        "Could not import config module (%s). Using built‑in defaults.", exc
    )

    class _ConfigFallback:
        DEBUG: bool = False
        HOST: str = "0.0.0.0"
        PORT: int = 8000
        LOG_LEVEL: str = "INFO"
        STATIC_FOLDER: str = "static"
        TEMPLATE_FOLDER: str = "templates"

    config = _ConfigFallback()  # type: ignore

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
def _setup_logging() -> None:
    """Configure root logger based on configuration."""
    log_level = getattr(logging, getattr(config, "LOG_LEVEL", "INFO").upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    # Reduce noise from Flask's internal logger when not in debug mode.
    if not getattr(config, "DEBUG", False):
        logging.getLogger("werkzeug").setLevel(logging.WARNING)


_setup_logging()
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Flask application factory
# --------------------------------------------------------------------------- #
def create_app() -> Flask:
    """
    Application factory that creates and configures the Flask app.

    Returns
    -------
    Flask
        Configured Flask application instance.
    """
    static_folder = Path(__file__).parent / getattr(config, "STATIC_FOLDER", "static")
    template_folder = Path(__file__).parent / getattr(config, "TEMPLATE_FOLDER", "templates")

    app = Flask(
        __name__,
        static_folder=str(static_folder),
        template_folder=str(template_folder),
        static_url_path="/static",
    )

    # ------------------------------------------------------------------- #
    # Configuration
    # ------------------------------------------------------------------- #
    app.config.from_mapping(
        DEBUG=getattr(config, "DEBUG", False),
        SECRET_KEY=os.getenv("FLASK_SECRET_KEY", "change-me-in-production"),
    )

    # ------------------------------------------------------------------- #
    # Routes
    # ------------------------------------------------------------------- #
    @app.route("/")
    def index() -> Any:
        """Serve the main HTML page."""
        index_path = static_folder / "index.html"
        if not index_path.is_file():
            logger.error("index.html not found in %s", static_folder)
            return "Application error: index.html missing.", 500
        return send_from_directory(static_folder, "index.html")

    @app.route("/health")
    def health() -> Dict[str, str]:
        """Simple health‑check endpoint used by monitoring tools."""
        return {"status": "ok"}

    # ------------------------------------------------------------------- #
    # Error handlers
    # ------------------------------------------------------------------- #
    @app.errorhandler(404)
    def not_found(error) -> Any:
        logger.info("404 Not Found: %s", error)
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error) -> Any:
        logger.exception("500 Internal Server Error: %s", error)
        return jsonify({"error": "Internal server error"}), 500

    return app


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    try:
        flask_app = create_app()
        host = getattr(config, "HOST", "0.0.0.0")
        port = getattr(config, "PORT", 8000)
        debug = getattr(config, "DEBUG", False)
        logger.info("Starting Flask server on %s:%s (debug=%s)", host, port, debug)
        flask_app.run(host=host, port=port, debug=debug)
    except Exception as exc:  # pragma: no cover
        logger.exception("Failed to start the application: %s", exc)
        sys.exit(1)