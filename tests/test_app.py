import json

import pytest
from src.app import create_app


@pytest.fixture
def client():
    """Create a Flask test client with testing configuration.

    Returns:
        FlaskClient: A client for sending test requests to the application.
    """
    app = create_app()
    app.config.update({"TESTING": True})
    with app.test_client() as testing_client:
        with app.app_context():
            yield testing_client


def test_valid_addition(client):
    """Verify that a simple addition expression returns the correct result.

    Sends a POST request with the expression ``2+3`` and expects a JSON
    response containing the result ``5`` with HTTP status 200.
    """
    payload = {"expression": "2+3"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 200, "Expected status code 200 for valid expression"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dictionary"
    assert "result" in data, "Response JSON must contain a 'result' key"
    assert data["result"] == 5, "2+3 should evaluate to 5"


def test_division_by_zero(client):
    """Ensure that division by zero is handled with a 400 Bad Request response.

    Sends a POST request with the expression ``1/0`` and expects an error
    message in the JSON payload.
    """
    payload = {"expression": "1/0"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400, "Division by zero should return status 400"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dictionary"
    assert "error" in data, "Error response must contain an 'error' key"


def test_malformed_expression(client):
    """Check that malformed arithmetic expressions return a 400 error.

    Sends a POST request with an invalid expression ``2++3`` and expects
    a JSON error response.
    """
    payload = {"expression": "2++3"}
    response = client.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400, "Malformed expression should return status 400"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dictionary"
    assert "error" in data, "Error response must contain an 'error' key"