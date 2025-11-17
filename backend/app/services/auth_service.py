from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token
from app.db.database import async_session_factory
from app.schemas.auth import LoginRequest, Token
from sqlalchemy.future import select
from datetime import timedelta
from fastapi import HTTPException, status
from app.core.config import settings


async def authenticate_user(email: str, password: str) -> User:
    """Validate user credentials.

    Args:
        email: User's email address.
        password: Plain password.
    Returns:
        User instance if authentication succeeds.
    Raises:
        HTTPException 401 if authentication fails.
    """
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return user


async def login(request: LoginRequest) -> Token:
    """Handle login flow: authenticate and issue JWT.

    Args:
        request: LoginRequest containing email and password.
    Returns:
        Token response with access token.
    """
    user = await authenticate_user(request.email, request.password)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data, expires_delta=access_token_expires)
    return Token(access_token=access_token)
