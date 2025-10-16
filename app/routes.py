"""
app/routes.py

Defines the Flask blueprint that serves the calculator UI and API endpoints.

Endpoints
---------
GET /
    Render the main calculator page (templates/index.html).

POST /api/calculate
    Accept a JSON payload:
        {
            "operand1": <number>,
            "operand2": <number>,
            "operator": "+", "-", "*", "/"
        }
    Returns JSON:
        {"result": <number>} on success
        {"error": "<message>"} on failure with appropriate HTTP status.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from flask import Blueprint, jsonify, request, render_template

from .calculator import calculate

# --------------------------------------------------------------------------- #
# Blueprint definition
# --------------------------------------------------------------------------- #
calculator_bp = Blueprint("calculator", __name__, template_folder="templates", static_folder="static")

# Configure a module‑level logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    # Prevent adding multiple handlers in case of reloads
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@calculator_bp.route("/", methods=["GET"])
def index() -> Any:
    """
    Render the calculator UI.

    Returns
    -------
    Response
        Rendered HTML page.
    """
    logger.debug("Rendering calculator UI")
    return render_template("index.html")


@calculator_bp.route("/api/calculate", methods=["POST"])
def api_calculate() -> Any:
    """
    Perform a calculation based on JSON payload.

    Expected JSON payload:
        {
            "operand1": <number>,
            "operand2": <number>,
            "operator": "+", "-", "*", "/"
        }

    Returns
    -------
    Response
        JSON with either ``{"result": <value>}`` or ``{"error": "<msg>"}``
        and an appropriate HTTP status code.
    """
    try:
        payload: Dict[str, Any] = request.get_json(force=True)
        logger.debug("Received payload: %s", payload)

        # Basic validation
        if not isinstance(payload, dict):
            raise ValueError("JSON payload must be an object")

        required_keys = {"operand1", "operand2", "operator"}
        missing = required_keys - payload.keys()
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(sorted(missing))}")

        operand1 = payload["operand1"]
        operand2 = payload["operand2"]
        operator = payload["operator"]

        # Ensure numeric operands
        if not isinstance(operand1, (int, float)):
            raise ValueError("operand1 must be a number")
        if not isinstance(operand2, (int, float)):
            raise ValueError("operand2 must be a number")
        if not isinstance(operator, str):
            raise ValueError("operator must be a string")

        logger.info(
            "Calculating: %s %s %s",
            operand1,
            operator,
            operand2,
        )
        result = calculate(operand1, operand2, operator)
        logger.info("Calculation result: %s", result)

        return jsonify({"result": result}), 200

    except ValueError as ve:
        # Client‑side error – bad request
        logger.warning("ValueError in /api/calculate: %s", ve)
        return jsonify({"error": str(ve)}), 400

    except Exception as exc:  # pragma: no cover – unexpected errors
        # Unexpected server error – log stack trace
        logger.exception("Unexpected error in /api/calculate")
        return jsonify({"error": "Internal server error"}), 500