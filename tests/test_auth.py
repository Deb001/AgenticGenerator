import json
import pytest
from app import create_app, db
from app.models import User

@pytest.fixture
def client():
    """Create a Flask test client with an in‑memory SQLite database."""
    app = create_app()
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI='sqlite:///:memory:',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def register_user(client, username="testuser", email="test@example.com", password="Password123!"):
    return client.post(
        "/auth/register",
        json={"username": username, "email": email, "password": password},
    )

def login_user(client, username="testuser", password="Password123!"):
    return client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )

def test_register_success(client):
    resp = register_user(client)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data.get("message") == "User registered successfully."

def test_register_duplicate_username(client):
    # First registration succeeds
    resp1 = register_user(client, username="dupuser", email="dup1@example.com")
    assert resp1.status_code == 201

    # Second registration with same username should fail
    resp2 = register_user(client, username="dupuser", email="dup2@example.com")
    assert resp2.status_code == 400
    data = resp2.get_json()
    assert "username" in data.get("error", "")

def test_login_success(client):
    register_user(client, username="loginuser", email="login@example.com")
    resp = login_user(client, username="loginuser", password="Password123!")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "token" in data

def test_login_invalid_password(client):
    register_user(client, username="badlogin", email="bad@example.com")
    resp = login_user(client, username="badlogin", password="WrongPassword!")
    assert resp.status_code == 401
    data = resp.get_json()
    assert "Invalid credentials" in data.get("error", "")
