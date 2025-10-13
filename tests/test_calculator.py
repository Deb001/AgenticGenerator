import pytest
from app import create_app


@pytest.fixture(scope="module")
def client():
    """
    Pytest fixture to provide a Flask test client.
    The application is created using the factory pattern defined in app.py.
    """
    app = create_app()
    with app.test_client() as client:
        yield client


def _post_calculate(client, num1: float, num2: float, operation: str):
    """
    Helper to send a POST request to the /calculate endpoint with form data.
    Returns the response object for assertions.
    """
    return client.post(
        "/calculate",
        data={
            "num1": str(num1),
            "num2": str(num2),
            "operation": operation,
        },
        follow_redirects=True,
    )


def test_addition(client):
    """
    Asserts that addition returns the correct sum.
    """
    response = _post_calculate(client, 3.5, 2.5, "add")
    assert response.status_code == 200
    assert b"Result: 6.0" in response.data


def test_subtraction(client):
    """
    Asserts subtraction works correctly.
    """
    response = _post_calculate(client, 10, 4, "subtract")
    assert response.status_code == 200
    assert b"Result: 6.0" in response.data


def test_multiplication(client):
    """
    Asserts multiplication works correctly.
    """
    response = _post_calculate(client, 7, 6, "multiply")
    assert response.status_code == 200
    assert b"Result: 42.0" in response.data


def test_division(client):
    """
    Asserts division works and handles floating point results.
    """
    response = _post_calculate(client, 9, 2, "divide")
    assert response.status_code == 200
    assert b"Result: 4.5" in response.data


def test_division_by_zero(client):
    """
    Ensures ZeroDivisionError is handled and an appropriate error message is returned.
    """
    response = _post_calculate(client, 5, 0, "divide")
    assert response.status_code == 200
    # The application should render an error message instead of a result.
    assert b"Error: Division by zero is not allowed." in response.data