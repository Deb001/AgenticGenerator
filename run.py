#!/usr/bin/env python3
"""
run.py
=======

Entry point for the Flask application.

Creates the Flask app instance using :func:`app.create_app` and starts the
development server on ``0.0.0.0:5000`` with debugging enabled.

The ``main`` function is wrapped with robust error handling and logging so that
any unexpected exception during startup is recorded and the process exits with a
non‑zero status code.

Typical usage::

    $ python -m run
"""

from __future__ import annotations

import logging
import sys
from typing import NoReturn

from app import create_app

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def main() -> NoReturn:
    """
    Initialise the Flask application and run the development server.

    The server is bound to ``0.0.0.0`` on port ``5000`` with ``debug=True``.
    Any exception raised while starting the server is logged and causes the
    process to exit with status code ``1``.
    """
    try:
        logger.info("Creating Flask application instance.")
        app = create_app()

        logger.info("Starting Flask development server on http://0.0.0.0:5000")
        # ``debug=True`` enables the reloader and debugger – suitable for
        # development. In production this flag should be disabled and a WSGI
        # server (e.g., gunicorn) should be used instead.
        app.run(host="0.0.0.0", port=5000, debug=True)

    except KeyboardInterrupt:
        # Graceful shutdown on Ctrl+C
        logger.info("Flask server stopped by user (KeyboardInterrupt).")
        sys.exit(0)

    except Exception as exc:  # pragma: no cover – unexpected errors
        # Log the full traceback for diagnostics
        logger.exception("Unexpected error while starting the Flask server: %s", exc)
        sys.exit(1)


if __name__ == "__main__":
    main()