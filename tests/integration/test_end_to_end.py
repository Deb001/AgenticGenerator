import json
import logging
from typing import Generator

import pytest
from flask.testing import FlaskClient

from src.app import create_app

logger = logging.getLogger(__name__)


@pytest.fixture
def client_fixture() -> Generator[FlaskClient, None, None]:
    """Create a Flask test client for integration tests.

    Yields:
        FlaskClient: A client that can be used to make requests against the app.
    """
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        with app.app_context():
            logger.debug("Flask application context pushed for integration test.")
            yield client
        logger.debug("Flask application context popped after integration test.")


def test_home_page(client_fixture: FlaskClient) -> None:
    """Verify that the home page loads successfully and returns HTML content.

    Args:
        client_fixture: The Flask test client fixture.
    """
    response = client_fixture.get("/")
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    content_type = response.headers.get("Content-Type", "")
    assert "text/html" in content_type, f"Expected HTML content, got {content_type}"
    # Basic sanity check that some HTML is returned
    assert b"<!DOCTYPE html>" in response.data or b"<html" in response.data


def test_api_success(client_fixture: FlaskClient) -> None:
    """Test the calculation API with a valid request and verify the correct result.

    Args:
        client_fixture: The Flask test client fixture.
    """
    payload = {"operand1": 5, "operand2": 3, "operator": "+"}
    response = client_fixture.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dictionary"
    assert "result" in data, "Response JSON missing 'result' key"
    assert data["result"] == 8, f"Expected result 8, got {data['result']}"


def test_api_invalid_operator(client_fixture: FlaskClient) -> None:
    """Ensure the API returns a 400 error when an unsupported operator is supplied.

    Args:
        client_fixture: The Flask test client fixture.
    """
    payload = {"operand1": 5, "operand2": 3, "operator": "invalid"}
    response = client_fixture.post(
        "/api/calculate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400, f"Expected 400 Bad Request, got {response.status_code}"
    data = response.get_json()
    assert isinstance(data, dict), "Response JSON should be a dictionary"
    assert "error" in data, "Error response should contain an 'error' key"