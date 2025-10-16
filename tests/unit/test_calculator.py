"""Unit tests for the arithmetic functions defined in ``src.calculator``.

The tests cover the four basic operations and verify that a
``ZeroDivisionError`` is raised when attempting to divide by zero.

These tests are executed by ``pytest`` and are part of the CI pipeline,
ensuring that the core business logic remains correct throughout
development.
"""

import pytest
from src.calculator import add, subtract, multiply, divide


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (1, 2, 3),
        (-1, -5, -6),
        (0, 0, 0),
        (123456, 654321, 777777),
        (-10, 20, 10),
    ],
)
def test_add(a: int, b: int, expected: int) -> None:
    """Validate that ``add`` returns the sum of two numbers."""
    assert add(a, b) == expected


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (5, 3, 2),
        (-1, -5, 4),
        (0, 0, 0),
        (1000, 1, 999),
        (-10, 20, -30),
    ],
)
def test_subtract(a: int, b: int, expected: int) -> None:
    """Validate that ``subtract`` returns the difference of two numbers."""
    assert subtract(a, b) == expected


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (2, 3, 6),
        (-1, -5, 5),
        (0, 10, 0),
        (7, -8, -56),
        (123, 0, 0),
    ],
)
def test_multiply(a: int, b: int, expected: int) -> None:
    """Validate that ``multiply`` returns the product of two numbers."""
    assert multiply(a, b) == expected


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (6, 3, 2.0),
        (5, 2, 2.5),
        (-9, -3, 3.0),
        (0, 5, 0.0),
        (7, -2, -3.5),
    ],
)
def test_divide(a: int, b: int, expected: float) -> None:
    """Validate that ``divide`` returns the correct quotient."""
    result = divide(a, b)
    # Use ``pytest.approx`` for floating‑point comparison
    assert result == pytest.approx(expected)


def test_divide_by_zero() -> None:
    """Ensure that dividing by zero raises ``ZeroDivisionError``."""
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)