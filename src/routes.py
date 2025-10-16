"""Routes module for the calculator Flask application.

Defines the blueprint, request handlers, and utility functions for performing
basic arithmetic operations via a JSON API and serving the main UI page.
"""

import logging
import operator
from typing import Any, Dict, Tuple

from flask import Blueprint, jsonify, render_template, request

# Configure module-level logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Mapping of supported operators to their corresponding functions
OP_MAP = {
    "+": operator.add,
    "-": operator.sub,
    "*": operator.mul,
    "/": operator.truediv,
}


def calculate(a: float, b: float, op: str) -> float:
    """Calculate the result of applying an operator to two numbers.

    Args:
        a: The left operand.
        b: The right operand.
        op: A string representing the operator ('+', '-', '*', '/').

    Returns:
        The numeric result of the operation.

    Raises:
        KeyError: If the operator is not supported.
        ZeroDivisionError: If division by zero is attempted.
    """
    logger.debug("Calculating: %s %s %s", a, op, b)
    operation = OP_MAP[op]  # May raise KeyError if op is invalid
    result = operation(a, b)  # May raise ZeroDivisionError for division
    logger.debug("Calculation result: %s", result)
    return result


def validate_payload(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate incoming JSON payload for the calculation endpoint.

    Checks that required keys exist and that their types are appropriate.

    Args:
        data: The parsed JSON dictionary from the request.

    Returns:
        A tuple (is_valid, error_message). If validation passes, is_valid is
        True and error_message is an empty string; otherwise, is_valid is
        False and error_message describes the problem.
    """
    required_keys = {"a", "b", "op"}
    missing = required_keys - data.keys()
    if missing:
        error = f"Missing required fields: {', '.join(sorted(missing))}"
        logger.warning(error)
        return False, error

    a = data.get("a")
    b = data.get("b")
    op = data.get("op")

    if not isinstance(a, (int, float)):
        error = "'a' must be a number."
        logger.warning(error)
        return False, error
    if not isinstance(b, (int, float)):
        error = "'b' must be a number."
        logger.warning(error)
        return False, error
    if not isinstance(op, str):
        error = "'op' must be a string."
        logger.warning(error)
        return False, error
    if op not in OP_MAP:
        error = f"Unsupported operator '{op}'. Supported operators are: {', '.join(OP_MAP)}."
        logger.warning(error)
        return False, error

    return True, ""


# Blueprint definition
calculator_bp = Blueprint("calculator", __name__)


@calculator_bp.route("/", methods=["GET"])
def index():
    """Render the main calculator UI page."""
    logger.info("Serving index page.")
    return render_template("index.html")


@calculator_bp.route("/api/calculate", methods=["POST"])
def api_calculate():
    """Handle calculation requests.

    Expects a JSON payload with keys 'a', 'b', and 'op'. Returns a JSON
    response containing the calculation result or an error message.
    """
    try:
        payload = request.get_json(force=True)
        logger.debug("Received payload: %s", payload)
    except Exception as exc:
        logger.error("Failed to parse JSON payload: %s", exc)
        return jsonify(error="Invalid JSON payload."), 400

    is_valid, error_msg = validate_payload(payload)
    if not is_valid:
        return jsonify(error=error_msg), 400

    a = float(payload["a"])
    b = float(payload["b"])
    op = payload["op"]

    try:
        result = calculate(a, b, op)
        logger.info("Calculation successful: %s %s %s = %s", a, op, b, result)
        return jsonify(result=result), 200
    except ZeroDivisionError:
        logger.warning("Division by zero attempted: %s / %s", a, b)
        return jsonify(error="Division by zero is not allowed."), 422
    except KeyError as exc:
        logger.error("Unsupported operator encountered: %s", exc)
        return jsonify(error=str(exc)), 400
    except Exception as exc:
        logger.exception("Unexpected error during calculation: %s", exc)
        return jsonify(error="Internal server error."), 500