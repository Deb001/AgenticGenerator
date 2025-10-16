"""
app.py
Flask application that serves a simple calculator UI and provides an API endpoint
for safe arithmetic expression evaluation.

Factory function:
    create_app() -> Flask
"""

import ast
import logging
from typing import Union

from flask import Flask, jsonify, render_template, request

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
logger = logging.getLogger(__name__)
if not logger.handlers:
    # Configure root logger only once
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

# --------------------------------------------------------------------------- #
# Expression evaluation utilities
# --------------------------------------------------------------------------- #
_ALLOWED_NODES = (
    ast.Expression,
    ast.BinOp,
    ast.UnaryOp,
    ast.Num,          # Python <3.8
    ast.Constant,    # Python >=3.8
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.Mod,
    ast.Pow,
    ast.UAdd,
    ast.USub,
    ast.Load,
)


def _is_allowed(node: ast.AST) -> bool:
    """Recursively verify that every node in the AST is allowed."""
    if not isinstance(node, _ALLOWED_NODES):
        return False
    for child in ast.iter_child_nodes(node):
        if not _is_allowed(child):
            return False
    return True


def evaluate_expression(expression: str) -> Union[float, str]:
    """
    Safely evaluate a simple arithmetic expression.

    Supported operators: +, -, *, /, %, ** (power), unary +/-
    Operands must be numeric literals.

    Parameters
    ----------
    expression: str
        The arithmetic expression to evaluate.

    Returns
    -------
    float
        The numeric result of the expression.

    str
        An error message if evaluation fails.
    """
    try:
        logger.debug("Evaluating expression: %s", expression)
        # Parse the expression into an AST node
        tree = ast.parse(expression, mode="eval")
        if not _is_allowed(tree):
            raise ValueError("Expression contains unsupported elements.")
        # Compile the AST safely
        compiled = compile(tree, filename="<ast>", mode="eval")
        result = eval(compiled, {"__builtins__": {}}, {})
        # Ensure the result is a number
        if not isinstance(result, (int, float)):
            raise ValueError("Result is not a numeric type.")
        return float(result)
    except SyntaxError as exc:
        logger.warning("Syntax error in expression %r: %s", expression, exc)
        return "Invalid syntax."
    except ZeroDivisionError:
        logger.warning("Division by zero in expression %r", expression)
        return "Division by zero."
    except ValueError as exc:
        logger.warning("Value error for expression %r: %s", expression, exc)
        return str(exc)
    except Exception as exc:  # pragma: no cover
        # Catch‑all for unexpected errors; log stack trace for debugging.
        logger.exception("Unexpected error evaluating expression %r", expression)
        return "An unexpected error occurred."


# --------------------------------------------------------------------------- #
# Flask application factory
# --------------------------------------------------------------------------- #
def create_app() -> Flask:
    """
    Application factory that creates and configures the Flask app.

    Returns
    -------
    Flask
        Configured Flask application instance.
    """
    app = Flask(__name__)

    # ------------------------------------------------------------------- #
    # Routes
    # ------------------------------------------------------------------- #
    @app.route("/", methods=["GET"])
    def index():
        """Render the calculator UI."""
        return render_template("index.html")

    @app.route("/api/evaluate", methods=["POST"])
    def api_evaluate():
        """
        API endpoint that receives a JSON payload:
            { "expression": "2 + 3 * (4 - 1)" }

        Returns JSON:
            { "result": 11.0, "error": null }   on success
            { "result": null, "error": "Message" } on failure
        """
        if not request.is_json:
            logger.info("Non‑JSON request received at /api/evaluate")
            return (
                jsonify({"result": None, "error": "Request payload must be JSON."}),
                400,
            )
        payload = request.get_json(silent=True)
        if not payload or "expression" not in payload:
            logger.info("Malformed JSON payload: %s", payload)
            return (
                jsonify({"result": None, "error": "Missing 'expression' field."}),
                400,
            )

        expression = payload["expression"]
        if not isinstance(expression, str):
            logger.info("Invalid type for expression: %r", expression)
            return (
                jsonify({"result": None, "error": "'expression' must be a string."}),
                400,
            )

        eval_result = evaluate_expression(expression)
        if isinstance(eval_result, str):
            # An error string was returned
            response = {"result": None, "error": eval_result}
            status_code = 400
        else:
            response = {"result": eval_result, "error": None}
            status_code = 200

        logger.info(
            "Evaluation request: %s -> %s (status %s)",
            expression,
            response,
            status_code,
        )
        return jsonify(response), status_code

    return app


# --------------------------------------------------------------------------- #
# Development entry point
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    # When executed directly, start a development server.
    # In production, a WSGI server (gunicorn, uWSGI, etc.) should import
    # `create_app` and serve the returned Flask instance.
    flask_app = create_app()
    flask_app.run(host="0.0.0.0", port=5000, debug=False)