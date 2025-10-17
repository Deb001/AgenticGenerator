import pytest
from calculator.evaluator import evaluate_expression


def test_addition() -> None:
    assert evaluate_expression("2 + 3") == 5
    assert evaluate_expression("10+20") == 30
    assert evaluate_expression("0 + 0") == 0


def test_subtraction() -> None:
    assert evaluate_expression("5 - 2") == 3
    assert evaluate_expression("100-50") == 50
    assert evaluate_expression("0 - 10") == -10


def test_multiplication() -> None:
    assert evaluate_expression("4 * 5") == 20
    assert evaluate_expression("7*8") == 56
    assert evaluate_expression("-3 * 6") == -18


def test_division() -> None:
    assert evaluate_expression("20 / 4") == 5
    assert evaluate_expression("9/3") == 3
    assert evaluate_expression("-10 / 2") == -5
    # Test floating point result
    assert evaluate_expression("7 / 2") == 3.5


def test_invalid_expression() -> None:
    with pytest.raises(ValueError):
        evaluate_expression("import os; os.system('rm -rf /')")
    with pytest.raises(ValueError):
        evaluate_expression("2 ++ 2")
    with pytest.raises(ValueError):
        evaluate_expression("hello world")