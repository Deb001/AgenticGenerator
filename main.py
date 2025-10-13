"""
main.py - Entry point for the calculator application.

This module provides a command‑line interface (CLI) for basic arithmetic
operations (add, subtract, multiply, divide).  It reads configuration from
`config.py`, validates user input, performs the requested calculation, and
outputs the result.

The design follows best practices:
- Uses `argparse` for robust CLI parsing.
- Implements a `Calculator` class with static methods for each operation.
- Handles division‑by‑zero and other runtime errors gracefully.
- Configurable logging based on settings from `config.py`.
- Includes type hints and comprehensive docstrings.
"""

from __future__ import annotations

import argparse
import logging
import sys
from typing import Callable, Tuple

# Local imports
try:
    import config
except ImportError as exc:
    raise ImportError("Failed to import configuration module 'config.py'.") from exc


# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
def _configure_logging() -> None:
    """Configure the root logger using settings from ``config``."""
    log_level = getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stderr)],
    )


# --------------------------------------------------------------------------- #
# Core calculator logic
# --------------------------------------------------------------------------- #
class Calculator:
    """Utility class offering static arithmetic operations."""

    @staticmethod
    def add(a: float, b: float) -> float:
        """Return the sum of *a* and *b*."""
        return a + b

    @staticmethod
    def subtract(a: float, b: float) -> float:
        """Return the difference of *a* and *b* (a - b)."""
        return a - b

    @staticmethod
    def multiply(a: float, b: float) -> float:
        """Return the product of *a* and *b*."""
        return a * b

    @staticmethod
    def divide(a: float, b: float) -> float:
        """
        Return the quotient of *a* divided by *b*.

        Raises:
            ZeroDivisionError: If *b* is zero.
        """
        if b == 0:
            raise ZeroDivisionError("Division by zero is undefined.")
        return a / b


# Mapping of operation names to the corresponding Calculator methods
_OPERATIONS: dict[str, Callable[[float, float], float]] = {
    "add": Calculator.add,
    "sub": Calculator.subtract,
    "subtract": Calculator.subtract,
    "mul": Calculator.multiply,
    "multiply": Calculator.multiply,
    "div": Calculator.divide,
    "divide": Calculator.divide,
}


# --------------------------------------------------------------------------- #
# Argument parsing
# --------------------------------------------------------------------------- #
def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """
    Parse command‑line arguments.

    Parameters
    ----------
    argv : list[str] | None
        Argument list to parse (defaults to ``sys.argv[1:]``).

    Returns
    -------
    argparse.Namespace
        Parsed arguments.
    """
    parser = argparse.ArgumentParser(
        description="Simple CLI calculator supporting add, sub, mul, and div."
    )
    parser.add_argument(
        "operation",
        type=str,
        choices=sorted(_OPERATIONS.keys()),
        help="Arithmetic operation to perform.",
    )
    parser.add_argument(
        "operands",
        type=float,
        nargs=2,
        metavar=("X", "Y"),
        help="Two numeric operands (e.g., 3 5).",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose (DEBUG) logging output.",
    )
    return parser.parse_args(argv)


# --------------------------------------------------------------------------- #
# Main execution flow
# --------------------------------------------------------------------------- #
def main(argv: list[str] | None = None) -> int:
    """
    Entry point for the calculator CLI.

    Parameters
    ----------
    argv : list[str] | None
        Optional list of arguments for testing; defaults to ``sys.argv[1:]``.

    Returns
    -------
    int
        Exit status code (0 for success, non‑zero for failure).
    """
    args = _parse_args(argv)

    # Adjust logging level if verbose flag is set
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger = logging.getLogger(__name__)
    logger.debug("Parsed arguments: %s", args)

    operation_func = _OPERATIONS.get(args.operation.lower())
    if operation_func is None:
        logger.error("Unsupported operation: %s", args.operation)
        return 1

    a, b = args.operands
    logger.debug("Operands received: a=%s, b=%s", a, b)

    try:
        result = operation_func(a, b)
    except ZeroDivisionError as zde:
        logger.error("Error during calculation: %s", zde)
        print(f"Error: {zde}", file=sys.stderr)
        return 1
    except Exception as exc:  # pragma: no cover - safeguard
        logger.exception("Unexpected error during calculation.")
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1

    print(f"Result: {result}")
    logger.info("Calculation successful: %s %s %s = %s", a, args.operation, b, result)
    return 0


if __name__ == "__main__":
    _configure_logging()
    sys.exit(main())