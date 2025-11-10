import bcrypt

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt.

    Args:
        password: The plaintext password.
    Returns:
        The bcrypt hash as a UTF‑8 string.
    Raises:
        ValueError: If the password is empty.
    """
    if not password:
        raise ValueError('Password must not be empty')
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash.

    Args:
        password: The plaintext password to verify.
        hashed: The stored bcrypt hash.
    Returns:
        True if the password matches the hash, False otherwise.
    """
    if not password or not hashed:
        return False
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
