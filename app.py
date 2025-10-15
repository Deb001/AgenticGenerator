"""
app.py
Flask backend that serves a simple calculator UI and provides an API endpoint
for arithmetic operations.

Provides:
- create_app(): builds and configures the Flask application.
- calculate(): performs basic arithmetic based on an operator.
- run_tests(): lightweight unit tests for the calculate function.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from flask import Flask, jsonify, request, render_template

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Core arithmetic logic
# --------------------------------------------------------------------------- #
def calculate(operand1: float, operand2: float, operator: str) -> float:
    """
    Perform an arithmetic operation.

    Args:
        operand1: First numeric operand.
        operand2: Second numeric operand.
        operator: One of '+', '-', '*', '/'.

    Returns:
        The result of the operation.

    Raises:
        ValueError: If the operator is unsupported.
        ZeroDivisionError: If division by zero is attempted.
    """
    logger.debug(
        "Calculating: %s %s %s", operand1, operator, operand2
    )  # noqa: G004

    if operator == "+":
        return operand1 + operand2
    if operator == "-":
        return operand1 - operand2
    if operator == "*":
        return operand1 * operand2
    if operator == "/":
        # Let Python raise ZeroDivisionError naturally
        return operand1 / operand2

    raise ValueError(f"Unsupported operator '{operator}'. Expected one of +, -, *, /.")


# --------------------------------------------------------------------------- #
# Flask application factory
# --------------------------------------------------------------------------- #
def create_app() -> Flask:
    """
    Initialise the Flask application, register routes and return the app instance.

    Returns:
        Configured Flask app.
    """
    app = Flask(__name__)

    # ----------------------------------------------------------------------- #
    # Routes
    # ----------------------------------------------------------------------- #
    @app.route("/", methods=["GET"])
    def index() -> Any:
        """Render the calculator UI."""
        logger.info("Serving index page")
        return render_template("index.html")

    @app.route("/api/calculate", methods=["POST"])
    def api_calculate() -> Any:
        """
        API endpoint that expects a JSON payload:
        {
            "operand1": <float>,
            "operand2": <float>,
            "operator": "<+|-|*|/>"
        }

        Returns JSON with either:
        - {"result": <float>}
        - {"error": "<message>"} with appropriate HTTP status code.
        """
        try:
            payload: Dict[str, Any] = request.get_json(force=True)
            logger.debug("Received payload: %s", payload)

            # Validate presence of required fields
            for field in ("operand1", "operand2", "operator"):
                if field not in payload:
                    msg = f"Missing field '{field}' in request payload."
                    logger.warning(msg)
                    return jsonify(error=msg), 400

            # Type conversion & validation
            try:
                op1 = float(payload["operand1"])
                op2 = float(payload["operand2"])
            except (TypeError, ValueError) as exc:
                msg = "Operands must be numeric."
                logger.warning("%s (%s)", msg, exc)
                return jsonify(error=msg), 400

            operator = str(payload["operator"]).strip()
            if operator not in {"+", "-", "*", "/"}:
                msg = f"Invalid operator '{operator}'. Allowed: +, -, *, /."
                logger.warning(msg)
                return jsonify(error=msg), 400

            # Perform calculation
            result = calculate(op1, op2, operator)
            logger.info(
                "Calculation successful: %s %s %s = %s", op1, operator, op2, result
            )
            return jsonify(result=result), 200

        except ZeroDivisionError:
            msg = "Division by zero is not allowed."
            logger.error(msg)
            return jsonify(error=msg), 400

        except Exception as exc:  # pragma: no cover
            # Unexpected errors – log stack trace and return generic message
            logger.exception("Unexpected error during calculation")
            return jsonify(error="Internal server error."), 500

    return app


# --------------------------------------------------------------------------- #
# Simple unit tests for the calculate function
# --------------------------------------------------------------------------- #
def run_tests() -> None:
    """
    Execute a minimal set of assertions for the calculate() helper.
    This function runs when the module is executed directly.
    """
    logger.info("Running calculate() unit tests...")

    # Positive cases
    assert calculate(1, 2, "+") == 3, "Addition failed"
    assert calculate(5, 3, "-") == 2, "Subtraction failed"
    assert calculate(4, 2.5, "*") == 10, "Multiplication failed"
    assert calculate(9, 3, "/") == 3, "Division failed"

    # Division by zero should raise
    try:
        calculate(1, 0, "/")
    except ZeroDivisionError:
        pass
    else:
        raise AssertionError("ZeroDivisionError not raised for division by zero")

    # Invalid operator should raise ValueError
    try:
        calculate(1, 2, "%")
    except ValueError:
        pass
    else:
        raise AssertionError("ValueError not raised for unsupported operator")

    logger.info("All calculate() tests passed.")


# --------------------------------------------------------------------------- #
# Entrypoint
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    run_tests()
    app = create_app()
    # Use 0.0.0.0 to be reachable from Docker or external hosts if needed
    app.run(host="0.0.0.0", port=5000, debug=False)