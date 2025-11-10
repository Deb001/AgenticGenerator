import os
import pytest
from app import create_app, db


@pytest.fixture(scope="session")
def app():
    """Create and configure a new app instance for each test session.

    The application is configured to use an in‑memory SQLite database so that
    tests run quickly and in isolation from any development or production data.
    """
    os.environ["FLASK_ENV"] = "development"
    app = create_app()
    # Override the database URI for testing purposes
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["TESTING"] = True

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Provide a Flask test client bound to the app fixture."""
    return app.test_client()


@pytest.fixture(scope="function")
def auth_headers(client):
    """Register a default test user, log in, and return an Authorization header.

    The returned dictionary can be unpacked directly into the ``headers``
    argument of ``client`` methods.
    """
    register_payload = {"email": "test@example.com", "password": "StrongPass123"}
    client.post("/api/auth/register", json=register_payload)

    login_payload = {"email": "test@example.com", "password": "StrongPass123"}
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200, "Login failed during auth_headers fixture"
    data = response.get_json()
    token = data.get("access_token") or data.get("token")
    assert token, "JWT token not found in login response"
    return {"Authorization": f"Bearer {token}"}
