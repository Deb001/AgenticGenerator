import pytest
from backend.app.core.security import get_password_hash, verify_password


def test_hash_and_verify_password():
    """A password should verify against its own hash and reject a wrong one."""
    password = "SuperSecret123!"
    hashed = get_password_hash(password)
    # Correct password verifies
    assert verify_password(password, hashed) is True
    # Incorrect password does not verify
    assert verify_password("WrongPassword", hashed) is False
