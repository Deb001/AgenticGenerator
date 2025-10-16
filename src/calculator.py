"""
src/calculator.py

Core arithmetic utilities for the Primitive Calculator project.

The module provides four simple functions:
- add(a, b)
- subtract(a, b)
- multiply(a, b)
- divide(a, b)

Each function accepts values that can be cast to ``float`` (e.g. ``int``,
``str`` representing a number, ``Decimal``).  The inputs are converted to
``float`` internally, the operation is performed, and the result is returned
as a ``float``.

The ``divide`` function validates that the divisor is not zero and raises a
``ZeroDivisionError`` with a clear, user‑friendly message if the check fails.

All functions are deliberately tiny and side‑effect free, making them easy to
unit‑test and safe to use from the Flask API layer.
"""

from __future__ import annotations

import logging
from typing import Union, Any

# Configure a module‑level logger. The application can configure handlers/formatters
# as needed; we simply obtain a logger instance here.
logger = logging.getLogger(__name__)

Number = Union[int, float, str, bytes, bytearray, "Decimal"]  # type: ignore[name-defined]


def _to_float(value: Any) -> float:
    """
    Convert *value* to ``float`` safely.

    Parameters
    ----------
    value: Any
        The value to convert. Accepted types are those that ``float()`` can handle
        (e.g. ``int``, ``float``, numeric ``str``).

    Returns
    -------
    float
        The converted floating‑point number.

    Raises
    ------
    TypeError
        If the value cannot be converted to ``float``.
    """
    try:
        result = float(value)
        logger.debug("Converted %r to float: %s", value, result)
        return result
    except (TypeError, ValueError) as exc:
        logger.error("Failed to convert %r to float", value)
        raise TypeError(f"Value {value!r} cannot be interpreted as a number.") from exc


def add(a: Number, b: Number) -> float:
    """
    Return the sum of *a* and *b*.

    Both arguments are converted to ``float`` before addition.

    Parameters
    ----------
    a, b : Number
        Operands to add.

    Returns
    -------
    float
        The arithmetic sum.
    """
    a_f = _to_float(a)
    b_f = _to_float(b)
    result = a_f + b_f
    logger.debug("add(%s, %s) = %s", a_f, b_f, result)
    return result


def subtract(a: Number, b: Number) -> float:
    """
    Return the difference of *a* minus *b*.

    Both arguments are converted to ``float`` before subtraction.

    Parameters
    ----------
    a, b : Number
        Operands where *a* is the minuend and *b* the subtrahend.

    Returns
    -------
    float
        The arithmetic difference.
    """
    a_f = _to_float(a)
    b_f = _to_float(b)
    result = a_f - b_f
    logger.debug("subtract(%s, %s) = %s", a_f, b_f, result)
    return result


def multiply(a: Number, b: Number) -> float:
    """
    Return the product of *a* and *b*.

    Both arguments are converted to ``float`` before multiplication.

    Parameters
    ----------
    a, b : Number
        Operands to multiply.

    Returns
    -------
    float
        The arithmetic product.
    """
    a_f = _to_float(a)
    b_f = _to_float(b)
    result = a_f * b_f
    logger.debug("multiply(%s, %s) = %s", a_f, b_f, result)
    return result


def divide(a: Number, b: Number) -> float:
    """
    Return the quotient of *a* divided by *b*.

    Both arguments are converted to ``float`` before division.  If *b* evaluates
    to zero, a ``ZeroDivisionError`` is raised with a clear message.

    Parameters
    ----------
    a, b : Number
        Operands where *a* is the dividend and *b* the divisor.

    Returns
    -------
    float
        The arithmetic quotient.

    Raises
    ------
    ZeroDivisionError
        If *b* is zero after conversion to ``float``.
    """
    a_f = _to_float(a)
    b_f = _to_float(b)

    if b_f == 0.0:
        logger.error("Attempted division by zero: divide(%s, %s)", a_f, b_f)
        raise ZeroDivisionError("Division by zero is undefined. The divisor 'b' must be non‑zero.")

    result = a_f / b_f
    logger.debug("divide(%s, %s) = %s", a_f, b_f, result)
    return result


__all__ = ["add", "subtract", "multiply", "divide"]