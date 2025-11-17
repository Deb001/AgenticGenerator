from src.models.user import User
from src.schemas.user import UserCreate, UserRead
from src.db import Session
from src.auth.security import get_password_hash, verify_password, create_access_token
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

def register_user(db: Session, user_in: UserCreate) -> UserRead:
    """Create a new user after hashing the password.

    Returns a ``UserRead`` schema. Handles duplicate email errors.
    """
    hashed = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return UserRead.from_orm(user)

def authenticate_user(db: Session, email: str, password: str) -> User:
    """Verify credentials and return the ``User`` ORM object.

    Raises ``HTTPException`` with 401 status if authentication fails.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")
    return user

def login_user(db: Session, email: str, password: str) -> dict:
    """Authenticate a user and return a JWT access token.

    The returned dictionary matches the typical OAuth2 token response.
    """
    user = authenticate_user(db, email, password)
    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}
