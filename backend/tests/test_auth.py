import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine

from backend.app.main import app
from backend.app.db import init_db

# Use an in‑memory SQLite database for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})

# Override the app's DB dependency
def get_test_db():
    with Session(engine) as session:
        yield session

app.dependency_overrides[backend.app.api.deps.get_db] = get_test_db

# Initialise tables for the test engine
init_db.init_db()

client = TestClient(app)

def test_register_and_login():
    # Register a new user
    response = client.post("/api/auth/register", json={"email": "test@example.com", "password": "StrongPass123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

    # Login with the same credentials
    response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "StrongPass123"})
    assert response.status_code == 200
    login_data = response.json()
    assert "access_token" in login_data
