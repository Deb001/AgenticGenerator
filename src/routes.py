"""
src.routes
~~~~~~~~~~

Defines the API blueprint and the `/api/calculate` endpoint.

The endpoint expects a JSON payload with the following keys:
- ``operand1``: numeric value (int or float)
- ``operand2``: numeric value (int or float)
- ``operator``: one of ``+``, ``-``, ``*``, ``/``

It validates the payload, performs the requested arithmetic operation and
returns a JSON response containing the result.

Error handling:
- Missing fields or unsupported operators raise ``BadRequest`` (400).
- Division by zero returns a 400 response with a clear error message.
"""

import logging
from typing import Callable, Dict

from flask import Blueprint, jsonify, request
from werkzeug.exceptions import BadRequest

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Operator definitions
# --------------------------------------------------------------------------- #
def _divide(a: float, b: float) -> float:
    """Return ``a / b`` raising ``ZeroDivisionError`` for ``b == 0``."""
    if b == 0:
        raise ZeroDivisionError("Division by zero")
    return a / b


ALLOWED_OPERATORS: Dict[str, Callable[[float, float], float]] = {
    "+": lambda a, b: a + b,
    "-": lambda a, b: a - b,
    "*": lambda a, b: a * b,
    "/": _divide,
}

# --------------------------------------------------------------------------- #
# Blueprint definition
# --------------------------------------------------------------------------- #
api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/calculate", methods=["POST"])
def calculate() -> "flask.Response":
    """
    Parse the incoming JSON payload, validate it, perform the arithmetic
    operation and return the result.

    Returns
    -------
    flask.Response
        JSON response with ``{'result': <value>}`` on success or an error
        message with status code 400 on failure.
    """
    # ------------------------------------------------------------------- #
    # Extract and validate JSON payload
    # ------------------------------------------------------------------- #
    try:
        payload = request.get_json(force=True)
    except Exception as exc:
        logger.exception("Failed to parse JSON payload")
        raise BadRequest("Invalid JSON payload") from exc

    if not isinstance(payload, dict):
        logger.error("Payload is not a JSON object: %r", payload)
        raise BadRequest("JSON payload must be an object")

    required_fields = {"operand1", "operand2", "operator"}
    missing = required_fields - payload.keys()
    if missing:
        logger.error("Missing required fields: %s", ", ".join(missing))
        raise BadRequest(f"Missing required fields: {', '.join(missing)}")

    operator = payload["operator"]
    if operator not in ALLOWED_OPERATORS:
        logger.error("Unsupported operator: %s", operator)
        raise BadRequest(f"Unsupported operator '{operator}'. Allowed: {', '.join(ALLOWED_OPERATORS)}")

    # ------------------------------------------------------------------- #
    # Convert operands to float
    # ------------------------------------------------------------------- #
    try:
        operand1 = float(payload["operand1"])
        operand2 = float(payload["operand2"])
    except (TypeError, ValueError) as exc:
        logger.exception("Operand conversion error")
        raise BadRequest("Operands must be numeric values") from exc

    # ------------------------------------------------------------------- #
    # Perform calculation
    # ------------------------------------------------------------------- #
    try:
        result = ALLOWED_OPERATORS[operator](operand1, operand2)
    except ZeroDivisionError as exc:
        logger.warning("Division by zero attempted")
        response = jsonify({"error": "Division by zero is not allowed"})
        response.status_code = 400
        return response
    except Exception as exc:  # Defensive: catch unexpected errors
        logger.exception("Unexpected error during calculation")
        response = jsonify({"error": "Internal server error"})
        response.status_code = 500
        return response

    logger.info(
        "Calculated %s %s %s = %s",
        operand1,
        operator,
        operand2,
        result,
    )
    return jsonify({"result": result})