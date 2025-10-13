#!/usr/bin/env python3
"""
app.py - Main Flask application entry point for the calculator project.

This module provides a factory function `create_app` that sets up a Flask
application, configures it, and registers the necessary routes. The core
business logic is encapsulated in the `calculate` function, which validates
input, performs arithmetic operations, handles errors, and renders the
result back to the user.

Author: AI-1 Team
"""

from __future__ import annotations

import logging
from typing import Dict, Callable

from flask import Flask, render_template, request, Response

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

# Mapping of operation names to their corresponding lambda functions.
OPERATIONS: Dict[str, Callable[[float, float], float]] = {
    "add": lambda a, b: a + b,
    "subtract": lambda a, b: a - b,
    "multiply": lambda a, b: a * b,
    "divide": lambda a, b: a / b if b != 0 else (_ for _ in ()).throw(ZeroDivisionError("division by zero")),
}

# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# --------------------------------------------------------------------------- #
# Core business logic
# --------------------------------------------------------------------------- #

def calculate(req: request) -> Response:
    """
    Handle a POST request from the calculator form.

    Parameters
    ----------
    req : flask.Request
        The incoming Flask request object containing form data.

    Returns
    -------
    flask.Response
        Rendered HTML page with the calculation result or an error message.

    Raises
    ------
    ValueError
        If input values cannot be converted to floats.
    KeyError
        If required form fields are missing.
    ZeroDivisionError
        If division by zero is attempted.
    """
    try:
        # Extract form data
        num1_raw = req.form["num1"]
        num2_raw = req.form["num2"]
        operation = req.form["operation"]

        logger.debug("Received form data: num1=%s, num2=%s, operation=%s", num1_raw, num2_raw, operation)

        # Convert to floats
        try:
            num1 = float(num1_raw)
            num2 = float(num2_raw)
        except ValueError as exc:
            logger.warning("Non-numeric input: %s, %s", num1_raw, num2_raw)
            raise ValueError("Both inputs must be numeric.") from exc

        # Retrieve operation function
        try:
            op_func = OPERATIONS[operation]
        except KeyError as exc:
            logger.warning("Unsupported operation requested: %s", operation)
            raise KeyError(f"Unsupported operation '{operation}'.") from exc

        # Perform calculation
        result = op_func(num1, num2)
        logger.info("Calculation successful: %s %s %s = %s", num1, operation, num2, result)

        return render_template(
            "index.html",
            result=result,
            error=None,
            num1=num1_raw,
            num2=num2_raw,
            operation=operation,
        )

    except ZeroDivisionError:
        error_msg = "Cannot divide by zero."
        logger.error(error_msg)
        return render_template(
            "index.html",
            result=None,
            error=error_msg,
            num1=req.form.get("num1", ""),
            num2=req.form.get("num2", ""),
            operation=req.form.get("operation", ""),
        )
    except (ValueError, KeyError) as exc:
        error_msg = str(exc)
        logger.error("Input validation failed: %s", error_msg)
        return render_template(
            "index.html",
            result=None,
            error=error_msg,
            num1=req.form.get("num1", ""),
            num2=req.form.get("num2", ""),
            operation=req.form.get("operation", ""),
        )
    except Exception as exc:  # pragma: no cover
        logger.exception("Unexpected error during calculation.")
        return render_template(
            "index.html",
            result=None,
            error="An unexpected error occurred.",
            num1=req.form.get("num1", ""),
            num2=req.form.get("num2", ""),
            operation=req.form.get("operation", ""),
        )


# --------------------------------------------------------------------------- #
# Flask application factory
# --------------------------------------------------------------------------- #

def create_app(config: dict | None = None) -> Flask:
    """
    Factory function to create and configure a Flask application.

    Parameters
    ----------
    config : dict, optional
        A dictionary of configuration values to override the default settings.

    Returns
    -------
    flask.Flask
        The configured Flask application instance.
    """
    app = Flask(__name__, template_folder="templates")

    # Default configuration
    app.config.update(
        SECRET_KEY="dev",  # In production, override with a secure key
    )

    if config:
        app.config.update(config)

    @app.route("/", methods=["GET"])
    def index() -> Response:
        """Render the calculator form."""
        return render_template(
            "index.html",
            result=None,
            error=None,
            num1="",
            num2="",
            operation="add",
        )

    @app.route("/calculate", methods=["POST"])
    def calculate_route() -> Response:
        """Endpoint to process calculator form submissions."""
        return calculate(request)

    return app