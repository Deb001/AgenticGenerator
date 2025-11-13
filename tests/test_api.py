import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_evaluate_endpoint_success(client):
    response = client.post(
        "/evaluate",
        json={"expression": "2+3*4"}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["result"] == 14

def test_evaluate_endpoint_invalid_json(client):
    response = client.post(
        "/evaluate",
        data="not json",
        content_type="application/json"
    )
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data

def test_evaluate_endpoint_missing_expression(client):
    response = client.post("/evaluate", json={})
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data

def test_evaluate_endpoint_error_in_expression(client):
    response = client.post("/evaluate", json={"expression": "1/0"})
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
