import pytest
from src.app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_homepage_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200
    # Verify that the response is HTML
    content_type = response.headers.get("Content-Type", "")
    assert content_type.startswith("text/html")
    # Basic sanity check that HTML content is present
    assert b"<html" in response.data.lower()


def test_calculate_success(client):
    payload = {"operand1": 5, "operand2": 3, "operator": "+"}
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, dict)
    assert "result" in data
    assert data["result"] == 8


def test_calculate_invalid_operator(client):
    payload = {"operand1": 5, "operand2": 3, "operator": "invalid"}
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert isinstance(data, dict)
    assert "error" in data


def test_calculate_divide_by_zero(client):
    payload = {"operand1": 5, "operand2": 0, "operator": "/"}
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert isinstance(data, dict)
    assert "error" in data