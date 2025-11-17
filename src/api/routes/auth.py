from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from src.schemas.user import UserCreate, UserRead
from src.auth.service import register_user, login_user
from src.api.dependencies import get_db_dependency
from src.db import Session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_endpoint(user_in: UserCreate, db: Session = Depends(get_db_dependency)):
    """Register a new user and return the created user data."""
    return register_user(db, user_in)

@router.post("/login")
def login_endpoint(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db_dependency)):
    """Authenticate a user and return a JWT access token."""
    token = login_user(db, form_data.username, form_data.password)
    return token
