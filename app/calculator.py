"""
app/calculator.py

Core arithmetic utilities for the calculator application.

Provides simple mathematical operations and a dispatcher that selects the
appropriate operation based on a string operator. All functions are pure,
type‑annotated and raise clear, user‑friendly exceptions for error conditions.
"""

from __future__ import annotations

import logging
from typing import Callable

# Configure a module‑level logger. The application can configure handlers/formatters
# globally; we just obtain the logger here.
logger = logging.getLogger(__name__)

__all__ = [
    "add",
    "subtract",
    "multiply",
    "divide",
    "calculate",
]


def add(a: float, b: float) -> float:
    """
    Return the sum of ``a`` and ``b``.

    Parameters
    ----------
    a: float
        First addend.
    b: float
        Second addend.

    Returns
    -------
    float
        The arithmetic sum.
    """
    result = a + b
    logger.debug("add(%s, %s) = %s", a, b, result)
    return result


def subtract(a: float, b: float) -> float:
    """
    Return the difference ``a - b``.

    Parameters
    ----------
    a: float
        Minuend.
    b: float
        Subtrahend.

    Returns
    -------
    float
        The arithmetic difference.
    """
    result = a - b
    logger.debug("subtract(%s, %s) = %s", a, b, result)
    return result


def multiply(a: float, b: float) -> float:
    """
    Return the product of ``a`` and ``b``.

    Parameters
    ----------
    a: float
        First factor.
    b: float
        Second factor.

    Returns
    -------
    float
        The arithmetic product.
    """
    result = a * b
    logger.debug("multiply(%s, %s) = %s", a, b, result)
    return result


def divide(a: float, b: float) -> float:
    """
    Return the quotient ``a / b``.

    Parameters
    ----------
    a: float
        Numerator.
    b: float
        Denominator.

    Returns
    -------
    float
        The arithmetic quotient.

    Raises
    ------
    ValueError
        If ``b`` is zero.
    """
    if b == 0:
        logger.error("Attempted division by zero: divide(%s, %s)", a, b)
        raise ValueError("Division by zero is not allowed.")
    result = a / b
    logger.debug("divide(%s, %s) = %s", a, b, result)
    return result


def _get_operator_func(operator: str) -> Callable[[float, float], float]:
    """
    Map an operator symbol to the corresponding arithmetic function.

    Parameters
    ----------
    operator: str
        One of '+', '-', '*', '/'.

    Returns
    -------
    Callable[[float, float], float]
        The function implementing the operation.

    Raises
    ------
    ValueError
        If the operator is not supported.
    """
    ops = {
        "+": add,
        "-": subtract,
        "*": multiply,
        "/": divide,
    }
    try:
        func = ops[operator]
        logger.debug("Operator '%s' resolved to function %s", operator, func.__name__)
        return func
    except KeyError as exc:
        logger.error("Unsupported operator: %s", operator)
        raise ValueError(f"Unsupported operator '{operator}'. Expected one of +, -, *, /.") from exc


def calculate(operand1: float, operand2: float, operator: str) -> float:
    """
    Dispatch to the appropriate arithmetic function based on ``operator``.

    Parameters
    ----------
    operand1: float
        The first operand.
    operand2: float
        The second operand.
    operator: str
        A string representing the operation: '+', '-', '*', '/'.

    Returns
    -------
    float
        The result of the arithmetic operation.

    Raises
    ------
    ValueError
        If ``operator`` is unsupported or if division by zero occurs.
    """
    logger.info(
        "Calculating: %s %s %s",
        operand1,
        operator,
        operand2,
    )
    func = _get_operator_func(operator)

    try:
        result = func(operand1, operand2)
        logger.info("Result of %s %s %s = %s", operand1, operator, operand2, result)
        return result
    except ValueError as exc:
        # Propagate ValueError from divide (e.g., division by zero) with a clear message.
        logger.exception("Error during calculation")
        raise ValueError(str(exc)) from exc