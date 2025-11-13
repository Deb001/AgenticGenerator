import pytest

from backend.evaluator import evaluate, EvaluationError

@pytest.mark.parametrize(
    "expr,expected",
    [
        ("1+2", 3),
        ("2*3+4", 10),
        ("2*(3+4)", 14),
        ("10/2", 5.0),
        ("2**3", 8),
        ("-5+3", -2),
        ("+4", 4),
        ("5%2", 1),
        ("(2+3)*(4-1)", 15),
        ("3 + 4 * 2 / (1 - 5) ** 2", 3.5),
    ],
)
def test_evaluate_success(expr, expected):
    assert evaluate(expr) == expected

def test_division_by_zero():
    with pytest.raises(EvaluationError, match="Division by zero"):
        evaluate("1/0")

def test_invalid_syntax():
    with pytest.raises(EvaluationError):
        evaluate("2+*3")

def test_unsupported_node():
    # Function calls are not allowed
    with pytest.raises(EvaluationError):
        evaluate("abs(-5)")

def test_non_numeric_constant():
    with pytest.raises(EvaluationError):
        evaluate("'string'")
