import logging
import re
from typing import List, Union

# Configure module logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Regular expression for tokenizing the expression
TOKEN_REGEX = r'\s*([+\-*/()]|\d+(?:\.\d+)?)\s*'

# Operator precedence and associativity
_OPERATORS = {
    '+': (1, 'L'),  # (precedence, associativity)
    '-': (1, 'L'),
    '*': (2, 'L'),
    '/': (2, 'L'),
}


def _tokenize(expr: str) -> List[str]:
    """Split the expression into a list of tokens.

    Args:
        expr: The arithmetic expression as a string.

    Returns:
        A list of token strings.

    Raises:
        ValueError: If the expression contains unsupported characters.
    """
    tokens = []
    pos = 0
    while pos < len(expr):
        match = re.match(TOKEN_REGEX, expr[pos:])
        if not match:
            logger.error("Unsupported character at position %d in expression: %s", pos, expr)
            raise ValueError(f"Unsupported character at position {pos}")
        token = match.group(1)
        tokens.append(token)
        pos += match.end()
    logger.debug("Tokenized expression: %s -> %s", expr, tokens)
    return tokens


def _infix_to_rpn(tokens: List[str]) -> List[str]:
    """Convert a list of infix tokens to Reverse Polish Notation using the Shunting‑Yard algorithm.

    Args:
        tokens: List of token strings in infix order.

    Returns:
        List of token strings in RPN order.

    Raises:
        ValueError: If the expression is malformed (e.g., mismatched parentheses).
    """
    output_queue: List[str] = []
    operator_stack: List[str] = []

    for token in tokens:
        if re.fullmatch(r'\d+(?:\.\d+)?', token):
            output_queue.append(token)
        elif token in _OPERATORS:
            while operator_stack:
                top = operator_stack[-1]
                if top in _OPERATORS:
                    top_prec, _ = _OPERATORS[top]
                    token_prec, token_assoc = _OPERATORS[token]
                    if (token_assoc == 'L' and token_prec <= top_prec) or (
                        token_assoc == 'R' and token_prec < top_prec
                    ):
                        output_queue.append(operator_stack.pop())
                        continue
                break
            operator_stack.append(token)
        elif token == '(':
            operator_stack.append(token)
        elif token == ')':
            while operator_stack and operator_stack[-1] != '(':
                output_queue.append(operator_stack.pop())
            if not operator_stack:
                logger.error("Mismatched parentheses in expression")
                raise ValueError("Mismatched parentheses")
            operator_stack.pop()  # Discard '('
        else:
            logger.error("Invalid token encountered: %s", token)
            raise ValueError(f"Invalid token: {token}")

    while operator_stack:
        top = operator_stack.pop()
        if top in ('(', ')'):
            logger.error("Mismatched parentheses after processing")
            raise ValueError("Mismatched parentheses")
        output_queue.append(top)

    logger.debug("RPN conversion result: %s", output_queue)
    return output_queue


def _apply_operator(op: str, left: float, right: float) -> float:
    """Apply an arithmetic operator to two operands.

    Args:
        op: Operator as a string ('+', '-', '*', '/').
        left: Left operand.
        right: Right operand.

    Returns:
        Result of the operation.

    Raises:
        ValueError: For division by zero.
    """
    if op == '+':
        return left + right
    if op == '-':
        return left - right
    if op == '*':
        return left * right
    if op == '/':
        if right == 0:
            logger.error("Division by zero attempted")
            raise ValueError("Division by zero")
        return left / right
    logger.error("Unsupported operator encountered: %s", op)
    raise ValueError(f"Unsupported operator: {op}")


def _evaluate_rpn(rpn_tokens: List[str]) -> float:
    """Evaluate a list of RPN tokens and return the numeric result.

    Args:
        rpn_tokens: Tokens in Reverse Polish Notation order.

    Returns:
        Computed numeric result.

    Raises:
        ValueError: If the expression is malformed.
    """
    stack: List[float] = []
    for token in rpn_tokens:
        if re.fullmatch(r'\d+(?:\.\d+)?', token):
            stack.append(float(token))
        elif token in _OPERATORS:
            if len(stack) < 2:
                logger.error("Insufficient operands for operator %s", token)
                raise ValueError("Malformed expression")
            right = stack.pop()
            left = stack.pop()
            result = _apply_operator(token, left, right)
            stack.append(result)
        else:
            logger.error("Invalid token in RPN expression: %s", token)
            raise ValueError(f"Invalid token in RPN expression: {token}")

    if len(stack) != 1:
        logger.error("Malformed RPN expression, stack after evaluation: %s", stack)
        raise ValueError("Malformed expression")
    logger.debug("RPN evaluation result: %s", stack[0])
    return stack[0]


def calculate_expression(expr: str) -> Union[float, str]:
    """Parse a simple arithmetic expression and compute its result.

    Supported operators: addition (+), subtraction (-), multiplication (*), division (/).
    Parentheses are allowed for grouping. Numbers may be integers or decimals.

    Args:
        expr: Arithmetic expression as a string.

    Returns:
        The computed result as a float.

    Raises:
        ValueError: If the expression contains unsupported characters,
                    is malformed, or attempts division by zero.
    """
    if not isinstance(expr, str):
        logger.error("Expression must be a string, got %s", type(expr))
        raise ValueError("Expression must be a string")

    expr = expr.strip()
    if not expr:
        logger.error("Empty expression provided")
        raise ValueError("Expression cannot be empty")

    logger.info("Calculating expression: %s", expr)

    tokens = _tokenize(expr)
    rpn = _infix_to_rpn(tokens)
    result = _evaluate_rpn(rpn)
    logger.info("Result of expression '%s' is %s", expr, result)
    return result