import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture
def client():
    """Create a TestClient instance for the FastAPI app."""
    return TestClient(app)

def test_unknown_route_returns_404(client: TestClient):
    """A request to an undefined endpoint should return 404."""
    response = client.get("/nonexistent")
    assert response.status_code == 404

def test_signup_missing_fields_returns_422(client: TestClient):
    """The signup endpoint must validate the request body and reject incomplete payloads.
    FastAPI automatically returns a 422 Unprocessable Entity when required fields are missing.
    """
    # Send an empty payload – both email and password are required
    response = client.post("/api/auth/signup", json={})
    assert response.status_code == 422
    # Send only email – password is missing
    response = client.post("/api/auth/signup", json={"email": "user@example.com"})
    assert response.status_code == 422

def test_login_invalid_credentials(monkeypatch, client: TestClient):
    """When the authentication service raises an error (e.g., wrong password), the endpoint should respond with 401.
    The real `login` implementation is replaced with a mock that always raises an exception.
    """
    async def mock_login(email: str, password: str):
        raise Exception("Invalid credentials")

    # Patch the function used inside the router. The import path mirrors the project layout.
    monkeypatch.setattr("backend.app.services.auth_service.login", mock_login)

    response = client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "incorrect"},
    )
    # The router translates service errors into a 401 response.
    assert response.status_code == 401

def test_login_success(monkeypatch, client: TestClient):
    """A successful login should return a JSON payload containing access and refresh tokens.
    The service layer is mocked to return deterministic token strings.
    """
    async def mock_login(email: str, password: str):
        return {
            "access_token": "test-access-token",
            "refresh_token": "test-refresh-token",
        }

    monkeypatch.setattr("backend.app.services.auth_service.login", mock_login)

    response = client.post(
        "/api/auth/login",
        json={"email": "good@example.com", "password": "CorrectPassword123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "test-access-token"
    assert data["refresh_token"] == "test-refresh-token"
