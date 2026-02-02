from datetime import timedelta
from typing import Optional

from sqlmodel import Session, select

from ..models.user import User
from ..core.security import hash_password, verify_password, create_email_token, decode_token
from ..services import email_service, audit_log_service
from ..core.config import settings

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def register_user(db: Session, email: str, password: str) -> User:
    existing = get_user_by_email(db, email)
    if existing:
        raise ValueError("User already exists")
    user = User(email=email, hashed_password=hash_password(password), is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    # Send verification email (async in production)
    token = create_email_token(str(user.id), token_type="email_verification", expires_minutes=1440)
    email_service.send_verification_email(user.email, token)
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user

def verify_email(db: Session, user_id: str) -> User:
    user = db.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    user.is_verified = True
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def initiate_password_reset(db: Session, email: str) -> None:
    user = get_user_by_email(db, email)
    if not user:
        # Do not reveal whether the email exists
        return
    token = create_email_token(str(user.id), token_type="password_reset", expires_minutes=60)
    email_service.send_password_reset_email(user.email, token)

def confirm_password_reset(db: Session, token: str, new_password: str) -> User:
    payload = decode_token(token)
    if payload.get("type") != "password_reset":
        raise ValueError("Invalid token type")
    user_id = payload.get("sub")
    user = db.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    user.hashed_password = hash_password(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
