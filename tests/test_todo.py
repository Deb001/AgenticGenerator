import json
import pytest
from app import create_app, db
from app.models import User, Todo

@pytest.fixture
def client():
    """Create a Flask test client with a fresh in‑memory SQLite database."""
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

def auth_header(client, username="testuser", password="Password123!"):
    """Register a user, log in, and return an Authorization header dict."""
    # Register the user
    client.post(
        "/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": password},
    )
    # Log in to obtain JWT
    login_resp = client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )
    token = login_resp.get_json().get("token")
    return {"Authorization": f"Bearer {token}"}

def test_create_todo(client):
    headers = auth_header(client)
    resp = client.post(
        "/todos",
        headers=headers,
        json={"title": "Buy milk", "description": "2% milk"},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "Buy milk"
    assert data["completed"] is False

def test_get_todos(client):
    headers = auth_header(client)
    # Create two todos
    client.post("/todos", headers=headers, json={"title": "Task 1"})
    client.post("/todos", headers=headers, json={"title": "Task 2"})
    # Retrieve list
    resp = client.get("/todos", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 2
    titles = {item["title"] for item in data}
    assert titles == {"Task 1", "Task 2"}

def test_update_todo(client):
    headers = auth_header(client)
    # Create a todo
    create_resp = client.post(
        "/todos",
        headers=headers,
        json={"title": "Read book"},
    )
    todo_id = create_resp.get_json()["id"]
    # Update completed flag
    resp = client.put(
        f"/todos/{todo_id}",
        headers=headers,
        json={"completed": True},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["completed"] is True

def test_delete_todo(client):
    headers = auth_header(client)
    # Create a todo
    create_resp = client.post(
        "/todos",
        headers=headers,
        json={"title": "Temporary"},
    )
    todo_id = create_resp.get_json()["id"]
    # Delete it
    del_resp = client.delete(f"/todos/{todo_id}", headers=headers)
    assert del_resp.status_code == 204
    # Verify it no longer exists
    get_resp = client.get(f"/todos/{todo_id}", headers=headers)
    assert get_resp.status_code == 404
