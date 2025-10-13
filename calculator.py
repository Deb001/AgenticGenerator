#!/usr/bin/env python3
"""
calculator.py

Core arithmetic logic with robust input validation and logging.
"""

from __future__ import annotations

import logging
from typing import Any, Iterable, Tuple

# Configure module-level logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class Calculator:
    """
    Encapsulates basic arithmetic operations with input validation.

    Methods
    -------
    add(a, b)
        Returns the sum of a and b.
    subtract(a, b)
        Returns the difference of a and b.
    multiply(a, b)
        Returns the product of a and b.
    divide(a, b)
        Returns the quotient of a and b. Raises ZeroDivisionError if b is zero.
    """

    def __init__(self) -> None:
        """Initializes the Calculator instance."""
        logger.debug("Calculator instance created")

    @staticmethod
    def _validate_input(*args: Any) -> None:
        """
        Internal helper to validate if all inputs are valid numbers.

        Parameters
        ----------
        *args : Any
            Variable length argument list of values to validate.

        Raises
        ------
        ValueError
            If any input is not an int or float.
        """
        for idx, value in enumerate(args):
            if not isinstance(value, (int, float)):
                logger.error(
                    "Invalid input at position %d: %r is not a number", idx, value
                )
                raise ValueError(
                    f"All inputs must be int or float. Invalid value at position {idx}: {value!r}"
                )
        logger.debug("All inputs validated: %s", args)

    def add(self, a: float | int, b: float | int) -> float | int:
        """
        Returns the sum of a and b.

        Parameters
        ----------
        a : number
            First addend.
        b : number
            Second addend.

        Returns
        -------
        number
            The sum of a and b.
        """
        self._validate_input(a, b)
        result = a + b
        logger.info("add(%s, %s) = %s", a, b, result)
        return result

    def subtract(self, a: float | int, b: float | int) -> float | int:
        """
        Returns the difference of a and b.

        Parameters
        ----------
        a : number
            Minuend.
        b : number
            Subtrahend.

        Returns
        -------
        number
            The difference of a and b.
        """
        self._validate_input(a, b)
        result = a - b
        logger.info("subtract(%s, %s) = %s", a, b, result)
        return result

    def multiply(self, a: float | int, b: float | int) -> float | int:
        """
        Returns the product of a and b.

        Parameters
        ----------
        a : number
            First factor.
        b : number
            Second factor.

        Returns
        -------
        number
            The product of a and b.
        """
        self._validate_input(a, b)
        result = a * b
        logger.info("multiply(%s, %s) = %s", a, b, result)
        return result

    def divide(self, a: float | int, b: float | int) -> float:
        """
        Returns the quotient of a and b.

        Parameters
        ----------
        a : number
            Dividend.
        b : number
            Divisor.

        Returns
        -------
        float
            The quotient of a and b.

        Raises
        ------
        ZeroDivisionError
            If the divisor is zero.
        """
        self._validate_input(a, b)
        if b == 0:
            logger.error("Attempted division by zero: %s / %s", a, b)
            raise ZeroDivisionError("Cannot divide by zero.")
        result = a / b
        logger.info("divide(%s, %s) = %s", a, b, result)
        return result