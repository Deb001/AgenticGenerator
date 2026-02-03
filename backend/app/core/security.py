from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Argon2 is a memory‑hard password hashing algorithm. The hasher is instantiated
# once and reused – this is safe because the underlying implementation is thread‑
# safe.
_hasher = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Return an Argon2 hash for the given plain‑text password."""
    return _hasher.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against an Argon2 hash.

    Returns ``True`` if the password matches, ``False`` otherwise.
    """
    try:
        return _hasher.verify(hashed, password)
    except VerifyMismatchError:
        return False
