import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine

from backend.app.main import app
from backend.app.db import init_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})

def get_test_db():
    with Session(engine) as session:
        yield session

app.dependency_overrides[backend.app.api.deps.get_db] = get_test_db

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_header():
    # Register and login to obtain a token
    client.post("/api/auth/register", json={"email": "profile@example.com", "password": "StrongPass123"})
    login_resp = client.post("/api/auth/login", json={"email": "profile@example.com", "password": "StrongPass123"})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_profile(auth_header):
    resp = client.get("/api/profile/me", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "profile@example.com"

def test_update_profile(auth_header):
    update_payload = {"investment_goal": "Retirement", "risk_tolerance": "Medium"}
    resp = client.put("/api/profile/me", json=update_payload, headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["investment_goal"] == "Retirement"
    assert data["risk_tolerance"] == "Medium"
