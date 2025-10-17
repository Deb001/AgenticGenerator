import ast
import operator
from typing import Any, Callable, Dict

# Mapping of AST operator nodes to corresponding functions from the operator module
OPERATORS: Dict[type, Callable[[Any, Any], Any]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

UNARY_OPERATORS: Dict[type, Callable[[Any], Any]] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _evaluate_node(node: ast.AST) -> float:
    """
    Recursively evaluate an AST node representing a safe arithmetic expression.

    Args:
        node: The AST node to evaluate.

    Returns:
        The numeric result of evaluating the node.

    Raises:
        ValueError: If the node type is not allowed or an illegal operation occurs.
    """
    if isinstance(node, ast.Expression):
        return _evaluate_node(node.body)

    if isinstance(node, ast.BinOp):
        left = _evaluate_node(node.left)
        right = _evaluate_node(node.right)

        op_type = type(node.op)
        if op_type not in OPERATORS:
            raise ValueError(f"Unsupported binary operator: {op_type.__name__}")

        # Division by zero checks for both true division and floor division
        if op_type in (ast.Div, ast.FloorDiv) and right == 0:
            raise ValueError("Division by zero")

        result = OPERATORS[op_type](left, right)
        return float(result)

    if isinstance(node, ast.UnaryOp):
        operand = _evaluate_node(node.operand)
        op_type = type(node.op)
        if op_type not in UNARY_OPERATORS:
            raise ValueError(f"Unsupported unary operator: {op_type.__name__}")
        result = UNARY_OPERATORS[op_type](operand)
        return float(result)

    # For Python 3.8+, numeric literals are represented by ast.Constant
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return float(node.value)
        raise ValueError(f"Unsupported constant type: {type(node.value).__name__}")

    # For older Python versions, ast.Num is used
    if isinstance(node, ast.Num):
        return float(node.n)

    raise ValueError(f"Disallowed expression element: {type(node).__name__}")


def evaluate_expression(expr: str) -> float:
    """
    Safely parse and evaluate a simple arithmetic expression.

    Only a limited set of operators and numeric literals are allowed.
    The function raises ValueError for any disallowed constructs,
    malformed expressions, or illegal operations such as division by zero.

    Args:
        expr: A string containing the arithmetic expression to evaluate.

    Returns:
        The result of the expression as a float.

    Raises:
        ValueError: If the expression contains disallowed nodes or cannot be parsed.
    """
    if not isinstance(expr, str):
        raise ValueError("Expression must be a string")

    try:
        parsed = ast.parse(expr, mode="eval")
    except SyntaxError as exc:
        raise ValueError(f"Malformed expression: {exc.msg}") from exc

    # Ensure the top-level node is an Expression
    if not isinstance(parsed, ast.Expression):
        raise ValueError("Only single expressions are allowed")

    return _evaluate_node(parsed)