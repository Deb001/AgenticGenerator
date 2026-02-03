import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from unittest.mock import patch

@pytest.fixture
def client():
    """Provide a TestClient that uses the real FastAPI app."""
    return TestClient(app)

@pytest.fixture
def user_payload():
    return {
        "email": "test@example.com",
        "password": "StrongPassword123!"
    }

def test_signup_success(client: TestClient, user_payload: dict):
    """A valid signup request should succeed and trigger a verification email.
    The email service is mocked to avoid external side‑effects.
    """
    with patch("backend.app.services.email_service.EmailService.send_verification_email") as mock_send:
        mock_send.return_value = None
        response = client.post("/api/auth/signup", json=user_payload)
    assert response.status_code == 200
    # The exact response shape depends on implementation – we only assert that a success indicator exists.
    json_resp = response.json()
    assert "detail" in json_resp or "msg" in json_resp

def test_signup_invalid_email(client: TestClient):
    payload = {"email": "not-an-email", "password": "StrongPassword123!"}
    response = client.post("/api/auth/signup", json=payload)
    # Pydantic validation should reject the payload
    assert response.status_code == 422

def test_login_success(client: TestClient, user_payload: dict):
    # Ensure the user exists first (signup may be mocked as above)
    with patch("backend.app.services.email_service.EmailService.send_verification_email"):
        client.post("/api/auth/signup", json=user_payload)
    response = client.post("/api/auth/login", json=user_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_login_wrong_password(client: TestClient, user_payload: dict):
    # Create the user
    with patch("backend.app.services.email_service.EmailService.send_verification_email"):
        client.post("/api/auth/signup", json=user_payload)
    wrong_payload = {"email": user_payload["email"], "password": "WrongPassword!"}
    response = client.post("/api/auth/login", json=wrong_payload)
    assert response.status_code == 401
    json_resp = response.json()
    assert "detail" in json_resp
