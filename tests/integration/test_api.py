"""
Integration tests for the calculator API.

These tests spin up the Flask application in testing mode and issue real HTTP
requests against the ``/api/calculate`` endpoint. They verify that:

* A valid request returns a 200 status code with the correct calculation result.
* An unknown operation returns a 400 status code with an appropriate error
  message.
* Division by zero is handled gracefully with a 400 status code and a clear
  error description.
"""

import json
import pytest
from src.app import create_app


@pytest.fixture
def client():
    """
    Create a Flask test client configured for testing.

    Returns:
        FlaskClient: A client that can be used to make requests to the app.
    """
    app = create_app()
    # Ensure the app runs in testing mode.
    app.config.update({"TESTING": True})

    # Flask's test_client works as a context manager, guaranteeing proper
    # teardown after each test.
    with app.test_client() as client:
        yield client


def test_calculate_success(client):
    """
    Verify that a valid calculation request returns the expected result.
    """
    payload = {"a": 10, "b": 5, "operation": "add"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert response.status_code == 200, f"Unexpected status: {response.status_code}"
    data = response.get_json()
    assert isinstance(data, dict), "Response is not JSON"
    assert "result" in data, "Missing 'result' key in response"
    assert data["result"] == 15, f"Incorrect calculation result: {data['result']}"


def test_calculate_invalid_operation(client):
    """
    Verify that an unsupported operation yields a 400 error with a helpful message.
    """
    payload = {"a": 10, "b": 5, "operation": "mod"}  # 'mod' is not supported
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    data = response.get_json()
    assert isinstance(data, dict), "Response is not JSON"
    assert "error" in data, "Missing 'error' key in response"
    assert "invalid operation" in data["error"].lower()


def test_calculate_division_by_zero(client):
    """
    Verify that dividing by zero is caught and returns a 400 error.
    """
    payload = {"a": 10, "b": 0, "operation": "divide"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    data = response.get_json()
    assert isinstance(data, dict), "Response is not JSON"
    assert "error" in data, "Missing 'error' key in response"
    # The exact wording may vary; we just ensure it mentions division by zero.
    assert "division by zero" in data["error"].lower()