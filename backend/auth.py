import os
import logging
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.db import get_session
from backend.models import User

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Password hashing utility
class PasswordHasher:
    """Utility class for hashing and verifying passwords using bcrypt."""

    def __init__(self):
        self._pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash(self, password: str) -> str:
        """Return a bcrypt hash for the given password.

        Parameters
        ----------
        password: str
            Plain‑text password.
        """
        return self._pwd_context.hash(password)

    def verify(self, password: str, hashed: str) -> bool:
        """Verify a plain‑text password against a stored bcrypt hash.

        Returns
        -------
        bool
            ``True`` if the password matches, ``False`` otherwise.
        """
        return self._pwd_context.verify(password, hashed)

# Instantiate a global hasher for reuse
pwd_context = PasswordHasher()

# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable not set")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token.

    Parameters
    ----------
    data: dict
        Payload data to encode (must contain a ``sub`` key for the user identifier).
    expires_delta: Optional[timedelta]
        Custom expiration delta. If ``None`` the default of ``ACCESS_TOKEN_EXPIRE_MINUTES`` is used.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decode a JWT token and return its payload.

    Raises
    ------
    HTTPException
        If the token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning("JWT decode error: %s", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)) -> User:
    """Dependency that extracts the JWT token, validates it, and returns the authenticated ``User``.

    The function also enforces that the user has the role ``advisor``.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    payload = decode_access_token(token)
    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload invalid")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if getattr(user, "role", None) != "advisor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return user