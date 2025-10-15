"""
app.py
Flask backend for a simple arithmetic calculator.

Provides:
- Basic arithmetic functions (add, subtract, multiply, divide)
- A dispatcher `calculate` that selects the operation based on a string token
- A single route '/' that renders a form, validates input, performs the calculation,
  and displays the result or an error message.

The template `templates/index.html` and static stylesheet `static/style.css`
must exist in the project for proper rendering.
"""

from __future__ import annotations

import logging
from typing import Callable, Dict

from flask import Flask, abort, render_template, request

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Flask application factory
# --------------------------------------------------------------------------- #
app = Flask(__name__)


# --------------------------------------------------------------------------- #
# Arithmetic operation implementations
# --------------------------------------------------------------------------- #
def add(a: float, b: float) -> float:
    """Return the sum of *a* and *b*."""
    return a + b


def subtract(a: float, b: float) -> float:
    """Return the difference of *a* and *b* (a - b)."""
    return a - b


def multiply(a: float, b: float) -> float:
    """Return the product of *a* and *b*."""
    return a * b


def divide(a: float, b: float) -> float:
    """
    Return the quotient of *a* divided by *b*.

    Raises:
        ZeroDivisionError: If *b* is zero.
    """
    if b == 0:
        raise ZeroDivisionError("Division by zero")
    return a / b


# Mapping from operator token to the corresponding function
operator_map: Dict[str, Callable[[float, float], float]] = {
    "+": add,
    "-": subtract,
    "*": multiply,
    "/": divide,
}


def calculate(a: float, b: float, op: str) -> float:
    """
    Dispatch to the appropriate arithmetic function based on *op*.

    Args:
        a: First operand.
        b: Second operand.
        op: Operator string (one of '+', '-', '*', '/').

    Returns:
        The result of the arithmetic operation.

    Raises:
        ValueError: If *op* is not a supported operator.
        ZeroDivisionError: Propagated from :func:`divide` when dividing by zero.
    """
    logger.debug("Calculating: %s %s %s", a, op, b)
    func = operator_map.get(op)
    if func is None:
        raise ValueError(f"Unsupported operator: {op!r}")
    return func(a, b)


# --------------------------------------------------------------------------- #
# View functions
# --------------------------------------------------------------------------- #
@app.route("/", methods=["GET", "POST"])
def index():
    """
    Render the calculator form and display the result if provided.

    GET:
        Render an empty form.

    POST:
        - Extract ``a``, ``b`` and ``op`` from the submitted form.
        - Validate presence and numeric conversion.
        - Perform the calculation.
        - Render the template with the original inputs, result, and any error.
    """
    result: float | None = None
    error_message: str | None = None
    a_val: str = ""
    b_val: str = ""
    op_val: str = ""

    if request.method == "POST":
        # Extract raw values
        a_val = request.form.get("a", "").strip()
        b_val = request.form.get("b", "").strip()
        op_val = request.form.get("op", "").strip()

        logger.info("Received POST data: a=%s, b=%s, op=%s", a_val, b_val, op_val)

        # Validate required fields
        if not a_val or not b_val or not op_val:
            logger.warning("Missing required form fields")
            abort(400, description="Missing required fields: a, b, and op must be provided.")

        try:
            a_num = float(a_val)
            b_num = float(b_val)
        except ValueError as exc:
            error_message = "Both a and b must be valid numbers."
            logger.exception("Invalid numeric input")
        else:
            try:
                result = calculate(a_num, b_num, op_val)
                logger.info("Calculation successful: %s %s %s = %s", a_num, op_val, b_num, result)
            except ZeroDivisionError:
                error_message = "Division by zero is not allowed."
                logger.exception("Division by zero attempted")
            except ValueError as exc:
                error_message = str(exc)
                logger.exception("Unsupported operator")

    # Render the template with context
    return render_template(
        "index.html",
        result=result,
        error=error_message,
        a=a_val,
        b=b_val,
        op=op_val,
        operators=sorted(operator_map.keys()),
    )


# --------------------------------------------------------------------------- #
# Application entry point
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    # Enable debug mode only when explicitly requested via environment variable
    import os

    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=5000, debug=debug_mode)