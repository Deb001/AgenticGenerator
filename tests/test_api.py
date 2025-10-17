import json

import pytest
from src.app import app


@pytest.fixture(scope="function")
def client():
    """
    Pytest fixture that provides a Flask test client.
    The app context is pushed for the duration of each test to ensure
    that request handling works as expected.
    """
    with app.test_client() as testing_client:
        # Establish an application context before running the tests.
        with app.app_context():
            yield testing_client


def test_addition(client):
    """
    Verify that a valid addition request returns the correct result.
    """
    payload = {"operand1": 2, "operand2": 3, "operator": "+"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 200, "Expected HTTP 200 for valid addition"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dict"
    assert "result" in data, "Response JSON must contain 'result' key"
    assert data["result"] == 5, "2 + 3 should equal 5"


def test_invalid_operator(client):
    """
    Ensure that using an unsupported operator results in a 400 Bad Request.
    """
    payload = {"operand1": 10, "operand2": 5, "operator": "?"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400, "Expected HTTP 400 for invalid operator"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dict"
    assert "error" in data, "Error response must contain 'error' key"


def test_division_by_zero(client):
    """
    Verify that division by zero is handled gracefully with a 400 response.
    """
    payload = {"operand1": 10, "operand2": 0, "operator": "/"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400, "Expected HTTP 400 for division by zero"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dict"
    assert "error" in data, "Error response must contain 'error' key"