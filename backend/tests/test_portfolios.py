import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine

from backend.app.main import app

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})

def get_test_db():
    with Session(engine) as session:
        yield session

app.dependency_overrides[backend.app.api.deps.get_db] = get_test_db

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_header():
    client.post("/api/auth/register", json={"email": "port@example.com", "password": "StrongPass123"})
    login_resp = client.post("/api/auth/login", json={"email": "port@example.com", "password": "StrongPass123"})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_portfolio_crud(auth_header):
    # Create portfolio
    create_resp = client.post("/api/portfolios/", json={"name": "Core", "description": "Core holdings"}, headers=auth_header)
    assert create_resp.status_code == 200
    portfolio = create_resp.json()
    pid = portfolio["id"]

    # Add item
    item_resp = client.post(f"/api/portfolios/{pid}/items", json={"ticker": "AAPL", "quantity": 10, "average_cost": 150}, headers=auth_header)
    assert item_resp.status_code == 200
    item = item_resp.json()
    assert item["ticker"] == "AAPL"

    # Update portfolio name
    update_resp = client.put(f"/api/portfolios/{pid}", json={"name": "Core Updated"}, headers=auth_header)
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Core Updated"

    # Delete item
    del_item_resp = client.delete(f"/api/portfolios/{pid}/items/{item['id']}", headers=auth_header)
    assert del_item_resp.status_code == 204

    # Delete portfolio
    del_port_resp = client.delete(f"/api/portfolios/{pid}", headers=auth_header)
    assert del_port_resp.status_code == 204
