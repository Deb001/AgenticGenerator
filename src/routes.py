"""Routes for arithmetic calculation API.

Provides a Flask blueprint with a single endpoint that evaluates simple
arithmetic expressions safely using the `ast` module.
"""

import ast
import operator
import logging
from typing import Any

from flask import Blueprint, request, jsonify, Response

# Configure module logger
logger = logging.getLogger(__name__)

# Mapping of allowed AST operator nodes to corresponding functions
ALLOWED_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
}

# Allowed unary operators
ALLOWED_UNARY_OPERATORS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _evaluate_node(node: ast.AST) -> float:
    """Recursively evaluate an AST node representing a numeric expression.

    Args:
        node: The AST node to evaluate.

    Returns:
        The numeric result of evaluating the node.

    Raises:
        ValueError: If the node contains disallowed constructs.
        ZeroDivisionError: Propagated from division operations.
    """
    if isinstance(node, ast.Expression):
        return _evaluate_node(node.body)

    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in ALLOWED_OPERATORS:
            raise ValueError(f"Unsupported binary operator: {op_type.__name__}")
        left = _evaluate_node(node.left)
        right = _evaluate_node(node.right)
        logger.debug("Evaluating BinOp: %s %s %s", left, op_type.__name__, right)
        return ALLOWED_OPERATORS[op_type](left, right)

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in ALLOWED_UNARY_OPERATORS:
            raise ValueError(f"Unsupported unary operator: {op_type.__name__}")
        operand = _evaluate_node(node.operand)
        logger.debug("Evaluating UnaryOp: %s %s", op_type.__name__, operand)
        return ALLOWED_UNARY_OPERATORS[op_type](operand)

    if isinstance(node, ast.Constant):  # Python 3.8+
        if isinstance(node.value, (int, float)):
            logger.debug("Constant value: %s", node.value)
            return float(node.value)
        raise ValueError("Only numeric constants are allowed")

    # For compatibility with older Python versions
    if isinstance(node, ast.Num):
        logger.debug("Num value: %s", node.n)
        return float(node.n)

    raise ValueError(f"Unsupported expression element: {type(node).__name__}")


def safe_eval(expr: str) -> float:
    """Parse and safely evaluate a simple arithmetic expression.

    Supported operators: +, -, *, /. Parentheses are allowed via grouping
    in the AST. No function calls, attribute access, or other constructs are
    permitted.

    Args:
        expr: The arithmetic expression as a string.

    Returns:
        The evaluated result as a float.

    Raises:
        ValueError: If the expression contains invalid syntax or disallowed nodes.
        ZeroDivisionError: If a division by zero occurs.
    """
    if not isinstance(expr, str):
        raise ValueError("Expression must be a string")

    logger.debug("Parsing expression: %s", expr)
    try:
        parsed = ast.parse(expr, mode="eval")
    except SyntaxError as exc:
        logger.error("Syntax error while parsing expression: %s", exc)
        raise ValueError("Malformed expression") from exc

    result = _evaluate_node(parsed)
    logger.info("Expression evaluated successfully: %s = %s", expr, result)
    return result


# Flask blueprint registration
calculator_bp = Blueprint("calculator_bp", __name__)


@calculator_bp.route("/api/calculate", methods=["POST"])
def calculate() -> Response:
    """Handle POST requests to evaluate an arithmetic expression.

    Expected JSON payload:
        {
            "expression": "<arithmetic expression>"
        }

    Returns:
        JSON response with either the calculation result or an error message.
    """
    try:
        payload: Any = request.get_json(force=True)
        if not isinstance(payload, dict):
            logger.warning("Invalid JSON payload type: %s", type(payload))
            return jsonify({"error": "Invalid JSON payload"}), 400

        expr = payload.get("expression")
        if not isinstance(expr, str):
            logger.warning("Missing or non-string 'expression' field")
            return jsonify({"error": "Field 'expression' must be a string"}), 400

        result = safe_eval(expr)
        return jsonify({"result": result}), 200

    except (ValueError, ZeroDivisionError) as exc:
        logger.error("Evaluation error: %s", exc)
        return jsonify({"error": str(exc)}), 400

    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Unexpected error during calculation")
        return jsonify({"error": "Internal server error"}), 500