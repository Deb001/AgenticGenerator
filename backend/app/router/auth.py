from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.schemas import UserCreate, Token
from backend.app.crud import create_user, get_user_by_email, authenticate_user
from backend.app.auth import get_password_hash, create_access_token
from backend.app.dependencies import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT access token.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token)


@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and immediately return a JWT token.
    """
    hashed_password = get_password_hash(user_in.password)
    user = create_user(db, user_in, hashed_password)
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token)