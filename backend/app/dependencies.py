from fastapi import Depends, Request, HTTPException, status
from sqlalchemy.orm import Session

from .db import SessionLocal
from .core.security import verify_password
from .core.token import decode_access_token
from .models.user import User
from .services.rate_limit_service import SimpleRateLimiter
from .config import settings


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Rate limiter instance
rate_limiter_instance = SimpleRateLimiter(
    max_requests=settings.RATE_LIMIT_MAX_REQUESTS,
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS,
)

# Dependency that extracts client IP and applies rate limiting
rate_limiter = rate_limiter_instance.limit(lambda request: request.client.host)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication"
        )
    token = auth_header.split(" ")[1]
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user
