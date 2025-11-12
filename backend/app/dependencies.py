from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.auth import decode_access_token
from backend.app.crud import get_user_by_email
from backend.app.schemas import TokenData
from backend.app.models import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT token and return the corresponding active user.

    Raises:
        HTTPException: 401 for missing/invalid token, 404 if user not found,
        403 if user is inactive.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload missing subject")
    token_data = TokenData(email=email)
    user = get_user_by_email(db, token_data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user


def advisor_required(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that ensures the current user has the advisor role.

    Raises:
        HTTPException: 403 if the user is not an advisor.
    """
    if not current_user.is_advisor:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Advisor role required")
    return current_user