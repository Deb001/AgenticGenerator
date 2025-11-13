import ast
import operator
from typing import Union

class EvaluationError(Exception):
    """Custom exception for evaluation errors."""
    pass

class SafeEvaluator:
    """Evaluates arithmetic expressions safely using Python's AST module.

    Supported operators: +, -, *, /, **, %, unary +/-, and parentheses.
    """

    _operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow,
        ast.Mod: operator.mod,
        ast.USub: operator.neg,
        ast.UAdd: operator.pos,
    }

    @classmethod
    def evaluate(cls, expression: str) -> Union[int, float]:
        """Parse and evaluate a mathematical expression.

        Args:
            expression: A string containing the arithmetic expression.
        Returns:
            The numeric result of the expression.
        Raises:
            EvaluationError: If the expression contains unsupported syntax or runtime errors.
        """
        try:
            parsed = ast.parse(expression, mode="eval")
        except SyntaxError as exc:
            raise EvaluationError(f"Invalid syntax: {exc}") from exc
        return cls._eval_node(parsed.body)

    @classmethod
    def _eval_node(cls, node: ast.AST) -> Union[int, float]:
        if isinstance(node, ast.Num):  # Python <3.8 compatibility
            return node.n
        if isinstance(node, ast.Constant):  # Python 3.8+
            if isinstance(node.value, (int, float)):
                return node.value
            raise EvaluationError(f"Unsupported constant type: {type(node.value)}")
        if isinstance(node, ast.BinOp):
            left = cls._eval_node(node.left)
            right = cls._eval_node(node.right)
            op_type = type(node.op)
            if op_type in cls._operators:
                try:
                    return cls._operators[op_type](left, right)
                except ZeroDivisionError as exc:
                    raise EvaluationError("Division by zero") from exc
            raise EvaluationError(f"Unsupported binary operator: {op_type}")
        if isinstance(node, ast.UnaryOp):
            operand = cls._eval_node(node.operand)
            op_type = type(node.op)
            if op_type in cls._operators:
                return cls._operators[op_type](operand)
            raise EvaluationError(f"Unsupported unary operator: {op_type}")
        raise EvaluationError(f"Unsupported expression node: {type(node)}")

def evaluate(expression: str) -> Union[int, float]:
    """Public helper that evaluates an arithmetic expression safely.

    This function is the primary entry point used by the Flask API.
    """
    return SafeEvaluator.evaluate(expression)
