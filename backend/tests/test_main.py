import pytest
from fastapi.testclient import TestClient

# Import the FastAPI app instance
from backend.app.main import app

# Import the SQLModel metadata and engine to create/drop tables for tests
from backend.app.db.session import engine, SQLModel

# ---------------------------------------------------------------------------
# Helper / fixtures
# ---------------------------------------------------------------------------

def dummy_send_email(*args, **kwargs):
    """Replace the real email‑sending function with a no‑op during tests.
    This prevents external network calls and keeps the test suite fast and
    deterministic.
    """
    return None

@pytest.fixture(autouse=True)
def override_email_send(monkeypatch):
    """Automatically monkey‑patch the email service for every test.
    The path must match the import location used inside the auth service.
    """
    monkeypatch.setattr(
        "backend.app.services.email_service.send_verification_email",
        dummy_send_email,
    )

@pytest.fixture(scope="function")
def client():
    """Create a fresh TestClient with a clean in‑memory SQLite database.
    The tables are created before each test and dropped afterwards.
    """
    # Create all tables defined by SQLModel models
    SQLModel.metadata.create_all(engine)
    with TestClient(app) as c:
        yield c
    # Drop tables to ensure isolation between tests
    SQLModel.metadata.drop_all(engine)

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_register_and_login_success(client: TestClient):
    """Register a new user, log in and access a protected endpoint.
    The test asserts the happy‑path flow and checks that the JWT token is
    returned and can be used to authenticate subsequent requests.
    """
    # ---- Registration ------------------------------------------------------
    register_resp = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "Password123"},
    )
    assert register_resp.status_code == 200
    assert register_resp.json().get("detail") == "User registered successfully"

    # ---- Login ------------------------------------------------------------
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "Password123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json().get("access_token")
    assert token is not None

    # ---- Access protected profile endpoint --------------------------------
    headers = {"Authorization": f"Bearer {token}"}
    profile_resp = client.get("/api/profile/me", headers=headers)
    assert profile_resp.status_code == 200
    profile_data = profile_resp.json()
    assert profile_data["email"] == "test@example.com"
    # The email should initially be unverified
    assert profile_data.get("email_verified") is False

def test_login_failure_invalid_credentials(client: TestClient):
    """Attempt to log in with a non‑existent user and verify the error response.
    This ensures that authentication failures are handled securely.
    """
    resp = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpass"},
    )
    assert resp.status_code == 401
    json_body = resp.json()
    # FastAPI's default error format includes a "detail" field
    assert "detail" in json_body
    assert json_body["detail"] == "Invalid credentials"

def test_email_verification_resend_endpoint(client: TestClient):
    """Register a user and then request a verification email resend.
    The email service is mocked, so we only verify the HTTP response.
    """
    # Register first
    client.post(
        "/api/auth/register",
        json={"email": "verify@example.com", "password": "Password123"},
    )
    # Login to obtain a token
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "verify@example.com", "password": "Password123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Call the resend verification endpoint (assumed path)
    resend_resp = client.post("/api/auth/resend-verification", headers=headers)
    assert resend_resp.status_code == 200
    assert resend_resp.json().get("detail") == "Verification email sent"
