import ast
import logging
import operator
import os

from flask import Flask, Response, jsonify, render_template, request

from config import Config

# Configure module-level logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    logger.setLevel(logging.INFO)


# Mapping of allowed AST operator nodes to their corresponding functions
ALLOWED_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
}


def evaluate_expression(expr: str) -> float:
    """Safely evaluate a simple arithmetic expression.

    Supported features:
        - Binary operators: +, -, *, /
        - Unary plus/minus
        - Parentheses
        - Integer and floating‑point literals

    Args:
        expr: The arithmetic expression as a string.

    Returns:
        The computed result as a float.

    Raises:
        ValueError: If the expression contains unsupported syntax or operators.
        ZeroDivisionError: If a division by zero occurs.
    """
    try:
        parsed = ast.parse(expr, mode="eval")
    except SyntaxError as exc:
        raise ValueError("Expression syntax is invalid.") from exc

    def _eval(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return _eval(node.body)

        if isinstance(node, ast.BinOp):
            left = _eval(node.left)
            right = _eval(node.right)
            op_type = type(node.op)
            if op_type in ALLOWED_OPERATORS:
                return ALLOWED_OPERATORS[op_type](left, right)
            raise ValueError(f"Unsupported binary operator: {op_type.__name__}")

        if isinstance(node, ast.UnaryOp):
            operand = _eval(node.operand)
            if isinstance(node.op, ast.UAdd):
                return +operand
            if isinstance(node.op, ast.USub):
                return -operand
            raise ValueError(f"Unsupported unary operator: {type(node.op).__name__}")

        if isinstance(node, ast.Num):  # For Python < 3.8
            return float(node.n)

        if isinstance(node, ast.Constant):  # For Python >= 3.8
            if isinstance(node.value, (int, float)):
                return float(node.value)
            raise ValueError("Only numeric constants are allowed.")

        raise ValueError(f"Unsupported expression element: {type(node).__name__}")

    result = _eval(parsed)
    return float(result)


def create_app() -> Flask:
    """Create and configure the Flask application.

    Returns:
        A fully configured Flask app instance.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    @app.route("/", methods=["GET"])
    def index() -> Response:
        """Render the calculator UI."""
        logger.info("GET / - Rendering index page.")
        return render_template("index.html")

    @app.route("/calculate", methods=["POST"])
    def calculate() -> Response:
        """Calculate the result of a submitted arithmetic expression.

        Expects JSON payload:
            {"expression": "1 + 2 * (3 - 4)"}

        Returns JSON:
            {"result": -1.0}
        or an error response with status 400.
        """
        logger.info("POST /calculate - Received calculation request.")
        if not request.is_json:
            logger.warning("Request does not contain JSON.")
            return jsonify(error="Request must be in JSON format."), 400

        data = request.get_json()
        expr = data.get("expression") if isinstance(data, dict) else None

        if not isinstance(expr, str):
            logger.warning("Missing or invalid 'expression' field.")
            return jsonify(error="Field 'expression' must be a string."), 400

        logger.debug("Evaluating expression: %s", expr)
        try:
            result = evaluate_expression(expr)
        except ZeroDivisionError as exc:
            logger.error("Division by zero in expression: %s", expr)
            return jsonify(error="Division by zero is not allowed."), 400
        except ValueError as exc:
            logger.error("Invalid expression: %s; error: %s", expr, exc)
            return jsonify(error=str(exc)), 400
        except Exception as exc:  # Catch‑all for unexpected errors
            logger.exception("Unexpected error while evaluating expression.")
            return jsonify(error="Internal server error."), 500

        logger.info("Expression evaluated successfully: %s = %s", expr, result)
        return jsonify(result=result)

    @app.errorhandler(404)
    def not_found(error) -> Response:  # pragma: no cover
        """Return JSON for 404 errors."""
        logger.warning("404 Not Found: %s", request.path)
        return jsonify(error="Resource not found."), 404

    return app


# Application instance for production / testing
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info("Starting Flask app on port %s", port)
    app.run(host="0.0.0.0", port=port)