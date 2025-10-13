"""
main.py
=======

Entry point for the calculator web application.

This module creates and runs a Flask application that serves the static
HTML/JS/CSS assets for the calculator UI.  It also provides a simple
health‑check endpoint and comprehensive error handling with structured
logging.

The configuration values are defined in :pymod:`config`.
"""

from __future__ import annotations

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any

from flask import Flask, send_from_directory, abort, jsonify, render_template

# Local imports – ensure the config module exists in the project root.
try:
    import config
except ImportError as exc:
    raise ImportError(
        "Unable to import the project's configuration module. "
        "Make sure `config.py` exists in the project root."
    ) from exc


def _setup_logging() -> None:
    """
    Configure application‑wide logging.

    Logs are written to both the console (STDOUT) and a rotating file
    located at ``logs/app.log``.  The log format includes timestamps,
    log level, module name and the message.
    """
    log_dir = Path(__file__).resolve().parent / "logs"
    log_dir.mkdir(exist_ok=True)

    log_formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler (STDOUT)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_formatter)
    console_handler.setLevel(logging.INFO)

    # Rotating file handler (max 5 MB per file, keep 3 backups)
    file_handler = RotatingFileHandler(
        filename=log_dir / "app.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding="utf-8",
    )
    file_handler.setFormatter(log_formatter)
    file_handler.setLevel(logging.DEBUG)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)


def create_app() -> Flask:
    """
    Factory function that creates and configures the Flask application.

    Returns
    -------
    Flask
        Configured Flask application instance.
    """
    _setup_logging()
    logger = logging.getLogger(__name__)

    app = Flask(
        __name__,
        static_folder=getattr(config, "STATIC_FOLDER", "static"),
        template_folder=getattr(config, "TEMPLATE_FOLDER", "templates"),
    )

    # Apply configuration values from config.py if they exist.
    app.config.update(
        {
            "DEBUG": getattr(config, "DEBUG", False),
            "TESTING": getattr(config, "TESTING", False),
            "SECRET_KEY": getattr(config, "SECRET_KEY", "change-me"),
        }
    )

    @app.route("/")
    def index() -> Any:
        """
        Serve the main calculator page.

        Returns
        -------
        Response
            Rendered ``index.html`` template.
        """
        logger.debug("Serving index.html")
        try:
            return render_template("index.html")
        except Exception as exc:
            logger.exception("Failed to render index.html")
            abort(500, description="Unable to load the calculator UI.")

    @app.route("/health")
    def health_check() -> Any:
        """
        Simple health‑check endpoint used by orchestration tools.

        Returns
        -------
        JSON response with status information.
        """
        logger.debug("Health check requested")
        return jsonify(status="ok", environment="production")

    # ------------------------------------------------------------------
    # Static file handling (fallback for any missing routes)
    # ------------------------------------------------------------------
    @app.route("/static/<path:filename>")
    def static_files(filename: str) -> Any:
        """
        Serve static assets (JS, CSS, images).

        Parameters
        ----------
        filename : str
            Relative path to the static file.

        Returns
        -------
        Response
            The requested static file or a 404 error.
        """
        logger.debug("Static file request: %s", filename)
        static_dir = Path(app.static_folder).resolve()
        requested_path = (static_dir / filename).resolve()

        # Security check: ensure the requested file is inside the static folder.
        if not str(requested_path).startswith(str(static_dir)):
            logger.warning("Attempted directory traversal: %s", filename)
            abort(404)

        if not requested_path.is_file():
            logger.info("Static file not found: %s", filename)
            abort(404)

        return send_from_directory(app.static_folder, filename)

    # ------------------------------------------------------------------
    # Error handlers
    # ------------------------------------------------------------------
    @app.errorhandler(404)
    def handle_404(error) -> Any:
        """Return JSON for 404 errors."""
        logger.warning("404 Not Found: %s", getattr(error, "description", ""))
        return jsonify(error="Not found", message=str(error)), 404

    @app.errorhandler(500)
    def handle_500(error) -> Any:
        """Return JSON for 500 errors."""
        logger.error("500 Internal Server Error: %s", getattr(error, "description", ""))
        return (
            jsonify(error="Internal server error", message=str(error)),
            500,
        )

    return app


def main() -> None:
    """
    Run the Flask development server.

    This function is only used when the module is executed directly.
    For production deployments, use a WSGI server such as gunicorn:
        gunicorn -w 4 "main:create_app()"
    """
    logger = logging.getLogger(__name__)
    try:
        app = create_app()
        host = getattr(config, "HOST", "127.0.0.1")
        port = getattr(config, "PORT", 5000)
        debug = getattr(config, "DEBUG", False)

        logger.info("Starting Flask server on %s:%s (debug=%s)", host, port, debug)
        app.run(host=host, port=port, debug=debug, use_reloader=debug)
    except Exception as exc:
        logger.exception("Failed to start the application")
        sys.exit(1)


if __name__ == "__main__":
    main()