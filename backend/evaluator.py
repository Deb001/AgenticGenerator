"""evaluator.py

Provides a safe arithmetic expression evaluator.
Supported operators: +, -, *, /, ** (exponent), and parentheses.
All operations are performed using Python's decimal.Decimal for precision and to avoid floating‑point surprises.
"""

import operator
import re
from decimal import Decimal, DivisionByZero, InvalidOperation
from typing import List, Tuple

# Mapping of operator symbols to corresponding functions and precedence
_OPERATORS = {
    '+': (operator.add, 1),
    '-': (operator.sub, 1),
    '*': (operator.mul, 2),
    '/': (operator.truediv, 2),
    '**': (operator.pow, 3),
}

_TOKEN_REGEX = re.compile(r"\s*(?:(\d+(?:\.\d+)?)|([+\-*/()])|(\*\*))")

class EvaluationError(Exception):
    """Custom exception for evaluation errors with a user‑friendly message."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

def _tokenize(expression: str) -> List[str]:
    """Convert the raw expression string into a list of tokens.

    Args:
        expression: The arithmetic expression supplied by the user.

    Returns:
        A list of string tokens (numbers, operators, parentheses).

    Raises:
        EvaluationError: If the expression contains illegal characters.
    """
    tokens: List[str] = []
    pos = 0
    while pos < len(expression):
        match = _TOKEN_REGEX.match(expression, pos)
        if not match:
            raise EvaluationError(f"Invalid character at position {pos}: '{expression[pos]}'")
        number, operator_char, power = match.groups()
        if number:
            tokens.append(number)
        elif power:
            tokens.append('**')
        elif operator_char:
            tokens.append(operator_char)
        pos = match.end()
    return tokens

def _shunting_yard(tokens: List[str]) -> List[str]:
    """Convert infix token list to Reverse Polish Notation using the Shunting‑Yard algorithm.

    Args:
        tokens: List of tokens in infix order.

    Returns:
        List of tokens in RPN order.
    """
    output_queue: List[str] = []
    operator_stack: List[str] = []
    for token in tokens:
        if re.fullmatch(r"\d+(?:\.\d+)?", token):
            output_queue.append(token)
        elif token in _OPERATORS:
            while operator_stack:
                top = operator_stack[-1]
                if top == '(':
                    break
                _, top_prec = _OPERATORS[top]
                _, token_prec = _OPERATORS[token]
                if top_prec >= token_prec:
                    output_queue.append(operator_stack.pop())
                else:
                    break
            operator_stack.append(token)
        elif token == '(':
            operator_stack.append(token)
        elif token == ')':
            while operator_stack and operator_stack[-1] != '(':
                output_queue.append(operator_stack.pop())
            if not operator_stack:
                raise EvaluationError("Mismatched parentheses")
            operator_stack.pop()  # Remove '(' from stack
        else:
            raise EvaluationError(f"Unknown token: {token}")
    while operator_stack:
        top = operator_stack.pop()
        if top in ('(', ')'):
            raise EvaluationError("Mismatched parentheses")
        output_queue.append(top)
    return output_queue

def _evaluate_rpn(rpn_tokens: List[str]) -> Decimal:
    """Evaluate a token list in Reverse Polish Notation.

    Args:
        rpn_tokens: Tokens in RPN order.

    Returns:
        Decimal result of the expression.

    Raises:
        EvaluationError: For division by zero or malformed expressions.
    """
    stack: List[Decimal] = []
    for token in rpn_tokens:
        if re.fullmatch(r"\d+(?:\.\d+)?", token):
            stack.append(Decimal(token))
        elif token in _OPERATORS:
            if len(stack) < 2:
                raise EvaluationError("Insufficient values in expression")
            b = stack.pop()
            a = stack.pop()
            func, _ = _OPERATORS[token]
            try:
                result = func(a, b)
            except DivisionByZero:
                raise EvaluationError("Division by zero")
            except InvalidOperation as exc:
                raise EvaluationError(str(exc))
            stack.append(result)
        else:
            raise EvaluationError(f"Invalid token in RPN: {token}")
    if len(stack) != 1:
        raise EvaluationError("The user input has too many values")
    return stack[0]

def evaluate_expression(expression: str) -> float:
    """Public API to evaluate an arithmetic expression safely.

    Args:
        expression: String containing the arithmetic expression.

    Returns:
        The numeric result as a Python float.

    Raises:
        EvaluationError: If the expression is malformed or contains illegal operations.
    """
    if not isinstance(expression, str) or not expression.strip():
        raise EvaluationError("Expression must be a non‑empty string")
    tokens = _tokenize(expression)
    rpn = _shunting_yard(tokens)
    result_decimal = _evaluate_rpn(rpn)
    # Convert Decimal to float for JSON serialisation; keep precision for typical calculator use.
    return float(result_decimal)
