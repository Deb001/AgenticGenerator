import json
import pytest


def test_register_success(client):
    payload = {"email": "newuser@example.com", "password": "Password123"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert "id" in data


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "password": "Password123"}
    # First registration should succeed
    first = client.post("/api/auth/register", json=payload)
    assert first.status_code == 201
    # Second registration with the same email must be rejected
    second = client.post("/api/auth/register", json=payload)
    assert second.status_code == 409


def test_login_success(client):
    register_payload = {"email": "loginuser@example.com", "password": "Password123"}
    client.post("/api/auth/register", json=register_payload)

    login_payload = {"email": "loginuser@example.com", "password": "Password123"}
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data or "token" in data


def test_login_invalid_password(client):
    register_payload = {"email": "badlogin@example.com", "password": "Password123"}
    client.post("/api/auth/register", json=register_payload)

    login_payload = {"email": "badlogin@example.com", "password": "WrongPass"}
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
