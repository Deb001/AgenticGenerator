from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.db import get_db, Session
from src.auth.security import decode_access_token
from src.models.user import User
from sqlalchemy.orm import joinedload

security = HTTPBearer(auto_error=False)

def get_db_dependency() -> Session:
    """FastAPI dependency that provides a database session for the request."""
    return next(get_db())

def get_current_user(
    db: Session = Depends(get_db_dependency),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """Extract the current user from a JWT token.

    Raises 401 if token is missing or invalid, 404 if user does not exist.
    """
    if not credentials or not credentials.scheme.lower() == "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
        role = payload.get("role")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    user = (
        db.query(User)
        .options(joinedload(User.portfolios))
        .filter(User.id == user_id)
        .first()
    )
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    # Attach role to user object for convenience
    user.role = role  # type: ignore
    return user

def require_role(required_role: str):
    """Factory that returns a dependency enforcing a specific role.

    Usage::
        @router.get("/admin")
        def admin_endpoint(user: User = Depends(require_role("admin"))):
            ...
    """
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return user
    return role_checker
