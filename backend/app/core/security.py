from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext

from .config import settings

# ---------------------------------------------------------------------------
# Password hashing utilities (bcrypt via passlib)
# ---------------------------------------------------------------------------
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Return a bcrypt hash of *password*.

    Args:
        password: Plain‑text password.
    Returns:
        A hashed password suitable for storage.
    """
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash.

    Args:
        plain_password: Password supplied by the user.
        hashed_password: Stored bcrypt hash.
    Returns:
        ``True`` if the password matches, ``False`` otherwise.
    """
    return _pwd_context.verify(plain_password, hashed_password)

# ---------------------------------------------------------------------------
# JWT handling
# ---------------------------------------------------------------------------
def _create_jwt(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token.

    Args:
        data: Payload to encode.
        expires_delta: Optional custom expiry.
    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token for *user_id*.

    The token payload contains a ``sub`` (subject) claim with the user's UUID.
    """
    return _create_jwt({"sub": user_id, "type": "access"}, expires_delta)


def create_email_token(user_id: str, token_type: str, expires_minutes: int = 60) -> str:
    """Create a short‑lived token for email verification or password reset.

    Args:
        user_id: UUID of the user.
        token_type: ``email_verification`` or ``password_reset``.
        expires_minutes: Expiration time in minutes.
    """
    return _create_jwt({"sub": user_id, "type": token_type}, timedelta(minutes=expires_minutes))


def decode_token(token: str) -> Dict[str, Any]:
    """Decode a JWT token and return its payload.

    Raises ``jwt.PyJWTError`` if the token is invalid or expired.
    """
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
