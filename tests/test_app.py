import pytest
from flask import Flask
from app import create_app


@pytest.fixture
def client() -> Flask.test_client:
    """Create a Flask test client configured for testing.

    Returns:
        Flask.test_client: A client for sending HTTP requests to the app.
    """
    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


def test_index_route(client) -> None:
    """Verify the index route returns HTML with a 200 status code."""
    response = client.get("/")
    assert response.status_code == 200
    # Basic sanity check that the response looks like HTML
    content = response.data.lower()
    assert b"<!doctype html>" in content or b"<html" in content


def test_calculate_success(client) -> None:
    """Send a valid arithmetic expression and expect the correct result."""
    payload = {"expression": "2+3*4"}  # Expected result: 14
    response = client.post("/calculate", json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert isinstance(json_data, dict)
    assert "result" in json_data
    assert json_data["result"] == 14


def test_calculate_divide_by_zero(client) -> None:
    """Division by zero should result in a 400 response with an error message."""
    payload = {"expression": "1/0"}
    response = client.post("/calculate", json=payload)
    assert response.status_code == 400
    json_data = response.get_json()
    assert isinstance(json_data, dict)
    assert "error" in json_data
    assert "division by zero" in json_data["error"].lower()


def test_calculate_invalid_syntax(client) -> None:
    """Malformed expressions should trigger a 400 response."""
    payload = {"expression": "2++2"}
    response = client.post("/calculate", json=payload)
    assert response.status_code == 400
    json_data = response.get_json()
    assert isinstance(json_data, dict)
    assert "error" in json_data