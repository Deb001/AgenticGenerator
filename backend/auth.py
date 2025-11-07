import os
import datetime
from datetime import timedelta
from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

# Environment variables – in production these should be set in a .env file
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGORITHM = "HS256"
DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES = 60


class JWTBearer(HTTPBearer):
    """FastAPI security scheme that extracts and validates a JWT token.

    The ``__call__`` method is invoked for each request that includes this
    dependency. It returns the validated ``HTTPAuthorizationCredentials`` object.
    """

    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        credentials: HTTPAuthorizationCredentials | None = await super().__call__(request)
        if credentials is None or credentials.scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme.")
        token = credentials.credentials
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            # The ``exp`` claim is automatically verified by ``jwt.decode``
        except JWTError as exc:
            raise HTTPException(status_code=401, detail="Invalid token.") from exc
        # Attach payload to request state for downstream use if needed
        request.state.user = payload
        return credentials


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token.

    Args:
        data: Dictionary containing the claims to embed in the token.
        expires_delta: Optional custom expiration delta. If omitted, the token
            expires after ``DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES`` minutes.
    Returns:
        A signed JWT string.
    """
    to_encode = data.copy()
    now = datetime.datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(JWTBearer()),
) -> Dict[str, Any]:
    """Dependency that validates a JWT token and returns its payload.

    Raises:
        HTTPException: 401 if token is missing, malformed, or expired.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # ``exp`` claim is validated by ``jwt.decode``; any error raises JWTError
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Could not validate credentials") from exc
    return payload
