import pytest
from src.routes import calculate, validate_payload


def test_calculate_addition() -> None:
    """Verify that addition operation returns the correct sum."""
    result = calculate(1, 2, "+")
    assert result == 3, "Addition of 1 and 2 should be 3"


def test_calculate_division_by_zero() -> None:
    """Ensure division by zero raises a ZeroDivisionError."""
    with pytest.raises(ZeroDivisionError):
        calculate(10, 0, "/")


def test_validate_payload_success() -> None:
    """Validate that a correct payload passes without raising."""
    payload = {"a": 5, "b": 3, "operation": "+"}
    assert validate_payload(payload) is True


def test_validate_payload_missing_field() -> None:
    """Check that missing required fields cause a ValueError."""
    payload = {"a": 5, "operation": "+"}  # 'b' is missing
    with pytest.raises(ValueError):
        validate_payload(payload)