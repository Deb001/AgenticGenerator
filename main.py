#!/usr/bin/env python3
"""
Main application entry point for the project.

This module sets up logging, parses command‑line arguments, and
provides a simple arithmetic CLI.  It imports configuration
settings from :mod:`config` and uses them to configure the logger
and display application metadata.

The code follows best practices for production Python code:
* type hints
* comprehensive docstrings
* robust error handling
* logging
* command‑line interface via :mod:`argparse`
"""

from __future__ import annotations

import argparse
import logging
import sys
from dataclasses import dataclass
from typing import Callable, Dict, Tuple

# Import configuration from the project
try:
    from config import LOG_LEVEL, APP_NAME, VERSION
except ImportError as exc:
    # If config.py is missing or incomplete, provide a clear error.
    raise ImportError(
        "Failed to import configuration from 'config.py'. "
        "Ensure that LOG_LEVEL, APP_NAME, and VERSION are defined."
    ) from exc


# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
def get_logger(name: str = __name__) -> logging.Logger:
    """
    Create and configure a logger for the application.

    Parameters
    ----------
    name : str, optional
        Name of the logger. Defaults to the module name.

    Returns
    -------
    logging.Logger
        Configured logger instance.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(LOG_LEVEL)
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


# --------------------------------------------------------------------------- #
# Arithmetic operations
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class Operation:
    """Container for an arithmetic operation."""

    name: str
    func: Callable[[float, float], float]
    description: str


def add(a: float, b: float) -> float:
    """Return the sum of two numbers."""
    return a + b


def subtract(a: float, b: float) -> float:
    """Return the difference of two numbers."""
    return a - b


def multiply(a: float, b: float) -> float:
    """Return the product of two numbers."""
    return a * b


def divide(a: float, b: float) -> float:
    """Return the quotient of two numbers.

    Raises
    ------
    ZeroDivisionError
        If ``b`` is zero.
    """
    if b == 0:
        raise ZeroDivisionError("Division by zero is undefined.")
    return a / b


OPERATIONS: Dict[str, Operation] = {
    "add": Operation("add", add, "Add two numbers"),
    "sub": Operation("sub", subtract, "Subtract second number from first"),
    "mul": Operation("mul", multiply, "Multiply two numbers"),
    "div": Operation("div", divide, "Divide first number by second"),
}


# --------------------------------------------------------------------------- #
# Argument parsing
# --------------------------------------------------------------------------- #
def build_parser() -> argparse.ArgumentParser:
    """
    Build the command‑line argument parser.

    Returns
    -------
    argparse.ArgumentParser
        Configured argument parser.
    """
    parser = argparse.ArgumentParser(
        prog=APP_NAME,
        description=f"{APP_NAME} v{VERSION} - Simple arithmetic CLI",
    )
    parser.add_argument(
        "operation",
        choices=OPERATIONS.keys(),
        help="Arithmetic operation to perform",
    )
    parser.add_argument(
        "operands",
        nargs=2,
        type=float,
        metavar=("NUM1", "NUM2"),
        help="Two numeric operands",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )
    return parser


# --------------------------------------------------------------------------- #
# Core execution logic
# --------------------------------------------------------------------------- #
def perform_operation(op_name: str, a: float, b: float) -> float:
    """
    Execute the specified arithmetic operation.

    Parameters
    ----------
    op_name : str
        Key of the operation in :data:`OPERATIONS`.
    a : float
        First operand.
    b : float
        Second operand.

    Returns
    -------
    float
        Result of the operation.

    Raises
    ------
    ValueError
        If the operation name is unknown.
    """
    if op_name not in OPERATIONS:
        raise ValueError(f"Unsupported operation: {op_name}")

    operation = OPERATIONS[op_name]
    return operation.func(a, b)


def main(argv: list[str] | None = None) -> int:
    """
    Main entry point for the application.

    Parameters
    ----------
    argv : list[str] | None, optional
        Command‑line arguments. If ``None``, :data:`sys.argv` is used.

    Returns
    -------
    int
        Exit code (0 for success, non‑zero for failure).
    """
    logger = get_logger()
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    logger.debug("Parsed arguments: %s", args)

    try:
        result = perform_operation(args.operation, *args.operands)
        logger.info(
            "%s operation on %s and %s yields: %s",
            args.operation,
            args.operands[0],
            args.operands[1],
            result,
        )
        print(result)
        return 0
    except ZeroDivisionError as exc:
        logger.error("Error: %s", exc)
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Unexpected error occurred")
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1


# --------------------------------------------------------------------------- #
# Script execution guard
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    sys.exit(main())