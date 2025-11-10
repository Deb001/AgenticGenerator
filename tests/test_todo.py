import json
import pytest


def test_create_and_get_todo(client, auth_headers):
    create_payload = {"title": "Test Todo", "description": "Details"}
    create_resp = client.post("/api/todos/", json=create_payload, headers=auth_headers)
    assert create_resp.status_code == 201
    todo = create_resp.get_json()
    assert "id" in todo
    todo_id = todo["id"]

    get_resp = client.get(f"/api/todos/{todo_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    fetched = get_resp.get_json()
    assert fetched["title"] == create_payload["title"]
    assert fetched["description"] == create_payload["description"]
    assert fetched["completed"] is False


def test_update_todo(client, auth_headers):
    # Create a todo first
    create_resp = client.post("/api/todos/", json={"title": "Old Title"}, headers=auth_headers)
    todo_id = create_resp.get_json()["id"]

    update_payload = {"title": "New Title", "completed": True}
    update_resp = client.put(f"/api/todos/{todo_id}", json=update_payload, headers=auth_headers)
    assert update_resp.status_code == 200
    updated = update_resp.get_json()
    assert updated["title"] == "New Title"
    assert updated["completed"] is True


def test_delete_todo(client, auth_headers):
    create_resp = client.post("/api/todos/", json={"title": "To Delete"}, headers=auth_headers)
    todo_id = create_resp.get_json()["id"]

    delete_resp = client.delete(f"/api/todos/{todo_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/todos/{todo_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_todo_isolation_between_users(client, auth_headers):
    # Create a todo with the first user
    create_resp = client.post("/api/todos/", json={"title": "User1 Todo"}, headers=auth_headers)
    todo_id = create_resp.get_json()["id"]

    # Register and log in a second user
    second_user = {"email": "second@example.com", "password": "StrongPass123"}
    client.post("/api/auth/register", json=second_user)
    login_resp = client.post("/api/auth/login", json=second_user)
    token2 = login_resp.get_json().get("access_token") or login_resp.get_json().get("token")
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Second user must not be able to access the first user's todo
    get_resp = client.get(f"/api/todos/{todo_id}", headers=headers2)
    assert get_resp.status_code == 404
