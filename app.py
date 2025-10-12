#!/usr/bin/env python3
"""
app.py - Main Flask application entry point for the calculator service.

This module defines the Flask app, routes, and calculation logic.
It imports configuration from config.py and serves static files
from the templates and static directories.

Author: AI-1 Team
"""

import logging
from typing import Any, Dict

from flask import Flask, jsonify, request, render_template, current_app
import config  # Local configuration module

# --------------------------------------------------------------------------- #
# Logging Configuration
# --------------------------------------------------------------------------- #

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Flask Application Factory
# --------------------------------------------------------------------------- #

def create_app() -> Flask:
    """
    Create and configure a Flask application instance.

    Returns
    -------
    Flask
        Configured Flask application.
    """
    app = Flask(__name__, template_folder="templates", static_folder="static")
    # Load configuration from config.py
    app.config.from_object(config)

    @app.route("/", methods=["GET"])
    def index() -> Any:
        """
        Render the main calculator UI.

        Returns
        -------
        Response
            HTML page rendered from templates/index.html.
        """
        logger.debug("Serving index page")
        return render_template("index.html")

    @app.route("/calculate", methods=["POST"])
    def calculate() -> Any:
        """
        Perform arithmetic calculation based on JSON payload.

        Expected JSON structure:
            {
                "operand1": <number>,
                "operand2": <number>,
                "operator": "<+|-|*|/>"
            }

        Returns
        -------
        Response
            JSON with either 'result' or 'error'.
        """
        logger.debug("Received calculation request")
        try:
            data: Dict[str, Any] = request.get_json(force=True)
        except Exception as exc:
            logger.exception("Invalid JSON payload")
            return jsonify(error="Malformed JSON"), 400

        # Validate presence of required keys
        for key in ("operand1", "operand2", "operator"):
            if key not in data:
                logger.warning("Missing parameter: %s", key)
                return jsonify(error=f"Missing parameter: {key}"), 400

        # Validate operands are numeric
        try:
            operand1 = float(data["operand1"])
            operand2 = float(data["operand2"])
        except (TypeError, ValueError) as exc:
            logger.warning("Non-numeric operands: %s", data)
            return jsonify(error="Operands must be numeric"), 400

        operator = str(data["operator"])
        operations = {
            "+": lambda a, b: a + b,
            "-": lambda a, b: a - b,
            "*": lambda a, b: a * b,
            "/": lambda a, b: a / b if b != 0 else (_ for _ in ()).throw(ZeroDivisionError),
        }

        if operator not in operations:
            logger.warning("Unsupported operator: %s", operator)
            return jsonify(error=f"Unsupported operator '{operator}'"), 400

        try:
            result = operations[operator](operand1, operand2)
        except ZeroDivisionError:
            logger.warning("Division by zero attempted")
            return jsonify(error="Division by zero is undefined"), 400
        except Exception as exc:
            logger.exception("Unexpected error during calculation")
            return jsonify(error="Internal server error"), 500

        logger.info("Calculation successful: %s %s %s = %s", operand1, operator, operand2, result)
        return jsonify(result=result), 200

    @app.errorhandler(404)
    def page_not_found(e):
        logger.warning("404 Not Found: %s", request.path)
        return jsonify(error="Resource not found"), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.exception("Internal server error")
        return jsonify(error="An unexpected error occurred"), 500

    return app


# --------------------------------------------------------------------------- #
# Application Entry Point
# --------------------------------------------------------------------------- #

app = create_app()

if __name__ == "__main__":
    # Run the Flask development server
    app.run(host="0.0.0.0", port=5000, debug=config.DEBUG)