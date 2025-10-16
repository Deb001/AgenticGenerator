"""Flask routes for the calculator application.

This module defines a Blueprint that provides two endpoints:
- ``/`` (GET): renders the main calculator UI.
- ``/api/calculate`` (POST): accepts a JSON payload with an arithmetic
  expression, evaluates it using :func:`calculate_expression`, and returns
  the result as JSON.

All request validation, error handling, and logging are performed here.
"""

import logging
from typing import Any, Dict

from flask import Blueprint, jsonify, render_template, request

from .calculator import calculate_expression

# Configure module‑level logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    # Prevent duplicate handlers in case of multiple imports
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Blueprint registration
calculator_bp = Blueprint("calculator", __name__)


@calculator_bp.route("/", methods=["GET"])
def index() -> Any:
    """Render the calculator's main page.

    Returns:
        A Flask response object containing the rendered ``index.html`` template.
    """
    logger.debug("Rendering index page.")
    return render_template("index.html")


@calculator_bp.route("/api/calculate", methods=["POST"])
def calculate() -> Any:
    """Evaluate an arithmetic expression sent via JSON.

    Expected JSON payload:
        {
            "expression": "<arithmetic expression as string>"
        }

    Returns:
        JSON response with either ``{"result": <value>}`` on success or
        ``{"error": "<message>"}`` with a 400 status code on failure.

    Raises:
        None. All errors are captured and transformed into JSON responses.
    """
    if not request.is_json:
        logger.warning("Request content type is not JSON.")
        return jsonify(error="Invalid content type: application/json required."), 400

    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    expression = payload.get("expression")

    if not isinstance(expression, str) or not expression.strip():
        logger.warning("Missing or empty 'expression' in request payload: %s", payload)
        return jsonify(error="Missing or empty 'expression' field."), 400

    logger.info("Received expression for evaluation: %s", expression)

    try:
        result = calculate_expression(expression)
    except ValueError as exc:
        logger.error("Error evaluating expression '%s': %s", expression, exc)
        return jsonify(error=str(exc)), 400
    except Exception as exc:  # Catch unexpected errors
        logger.exception("Unexpected error while evaluating expression.")
        return jsonify(error="Internal server error."), 500

    logger.debug("Expression result: %s = %s", expression, result)
    return jsonify(result=result)