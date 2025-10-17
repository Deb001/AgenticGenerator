"""Application entry point for the Flask service.

This module creates the Flask application using the factory defined in
:mod:`src.__init__` (exposed as ``create_app``) and runs it when executed
directly. It also configures a basic logger for the process.
"""

import logging
from . import create_app

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
# In a real deployment the logging configuration would be more elaborate
# (handlers, formatters, external services, etc.). For the purpose of this
# entry point we set up a simple console logger that can be overridden by
# the Flask app's own configuration if needed.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Create and run the Flask application.

    The function isolates the start‑up logic so it can be imported and
    invoked by external tools (e.g., Docker CMD) without executing on
    import.
    """
    try:
        app = create_app()
        logger.info("Flask application created successfully")

        # Use host/port from the Flask config if provided; otherwise fall back
        # to the defaults required by the Dockerfile / typical development.
        host = app.config.get("HOST", "0.0.0.0")
        port = int(app.config.get("PORT", 5000))

        logger.info("Starting Flask server on %s:%s", host, port)
        app.run(host=host, port=port)
    except Exception as exc:  # pragma: no cover
        logger.exception("Failed to start Flask application: %s", exc)
        raise


if __name__ == "__main__":
    main()