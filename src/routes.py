"""
src.routes
~~~~~~~~~~

Flask blueprint that exposes a single endpoint ``/api/calculate``.
The endpoint expects a JSON payload with the following keys:

* ``a`` – first operand (int or float)
* ``b`` – second operand (int or float)
* ``op`` – operation to perform; one of ``add``, ``subtract``,
  ``multiply`` or ``divide`` (case‑insensitive)

The request is validated, the appropriate arithmetic function from
``src.calculator`` is invoked and a JSON response containing the result
or an error message is returned.

The blueprint is imported and registered in :pymod:`src.app`.
"""

from __future__ import annotations

import logging
from typing import Callable, Dict, Any

from flask import Blueprint, request, jsonify, Response

from src.calculator import add, subtract, multiply, divide

# --------------------------------------------------------------------------- #
# Blueprint definition
# --------------------------------------------------------------------------- #
api_bp = Blueprint("api", __name__, url_prefix="/api")

# --------------------------------------------------------------------------- #
# Logger configuration
# --------------------------------------------------------------------------- #
logger = logging.getLogger(__name__)
if not logger.handlers:
    # Prevent adding multiple handlers in case of repeated imports
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


# --------------------------------------------------------------------------- #
# Operation mapping
# --------------------------------------------------------------------------- #
_OPERATION_MAP: Dict[str, Callable[[float, float], float]] = {
    "add": add,
    "subtract": subtract,
    "multiply": multiply,
    "divide": divide,
}


def _parse_number(value: Any, name: str) -> float:
    """
    Convert ``value`` to ``float`` raising a ``ValueError`` with a clear
    message if conversion fails.
    """
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Field '{name}' must be a number.") from exc


def _validate_payload(payload: dict) -> tuple[float, float, Callable[[float, float], float]]:
    """
    Validate the incoming JSON payload and return the two operands and the
    operation function.

    Raises:
        ValueError: If any validation rule is broken.
    """
    required_keys = {"a", "b", "op"}
    missing = required_keys - payload.keys()
    if missing:
        raise ValueError(f"Missing required field(s): {', '.join(sorted(missing))}")

    # Extract and coerce numbers
    a = _parse_number(payload["a"], "a")
    b = _parse_number(payload["b"], "b")

    # Resolve operation
    op_key = str(payload["op"]).strip().lower()
    operation = _OPERATION_MAP.get(op_key)
    if operation is None:
        raise ValueError(
            f"Invalid operation '{payload['op']}'. "
            f"Supported operations are: {', '.join(sorted(_OPERATION_MAP))}."
        )

    return a, b, operation


@api_bp.route("/calculate", methods=["POST"])
def calculate() -> Response:
    """
    Handle ``POST /api/calculate`` requests.

    Expected JSON body:
        {
            "a": <number>,
            "b": <number>,
            "op": "add" | "subtract" | "multiply" | "divide"
        }

    Returns:
        * 200 – ``{'result': <number>}`` on success.
        * 400 – ``{'error': <message>}`` on validation or runtime error.
    """
    try:
        payload = request.get_json(force=True)
        if not isinstance(payload, dict):
            raise ValueError("JSON payload must be an object.")
    except Exception as exc:
        logger.warning("Invalid JSON payload: %s", exc)
        return jsonify({"error": "Invalid JSON payload."}), 400

    try:
        a, b, operation = _validate_payload(payload)
        logger.debug("Performing %s with a=%s, b=%s", payload["op"], a, b)
        result = operation(a, b)
    except ZeroDivisionError:
        logger.warning("Division by zero attempted with a=%s, b=%s", a, b)
        return jsonify({"error": "Division by zero is not allowed."}), 400
    except ValueError as exc:
        logger.warning("Payload validation error: %s", exc)
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover – unexpected errors
        logger.exception("Unexpected error during calculation.")
        return jsonify({"error": "Internal server error."}), 500

    logger.info("Calculation successful: %s %s %s = %s", a, payload["op"], b, result)
    return jsonify({"result": result}), 200