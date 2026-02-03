import pytest
from datetime import timedelta
from backend.app.core.token import create_access_token, decode_token


def test_create_and_decode_jwt():
    """Create a JWT access token and ensure it can be decoded back to the original payload.
    The implementation uses the secret defined in ``backend/app/config.py``.
    """
    payload = {"sub": "user@example.com", "role": "user"}
    token = create_access_token(data=payload, expires_delta=timedelta(minutes=5))
    decoded = decode_token(token)
    assert decoded["sub"] == payload["sub"]
    assert decoded["role"] == payload["role"]
