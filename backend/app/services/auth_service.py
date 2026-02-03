import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings
from ..core.security import get_password_hash, verify_password
from ..core.token import create_access_token, create_refresh_token
from ..models.user import User
from ..models.email_verification_token import EmailVerificationToken
from ..services.token_store import TokenStore
from ..services.email_service import send_email
from ..services.audit_service import record


class AuthService:
    """Business logic for authentication flows.

    Orchestrates password hashing, JWT creation, refresh‑token rotation and audit logging.
    """

    def __init__(self, db: Session):
        self.db = db
        self.token_store = TokenStore(db)

    def _get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def signup(self, email: str, password: str, full_name: Optional[str] = None) -> User:
        if self._get_user_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            full_name=full_name,
            is_verified=False,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        token_str = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        verification = EmailVerificationToken(
            token=token_str, user_id=user.id, expires_at=expires_at
        )
        self.db.add(verification)
        self.db.commit()

        verify_url = f"{settings.GOOGLE_OAUTH_REDIRECT_URI}/verify-email?token={token_str}"
        # Fire‑and‑forget email sending.
        import asyncio

        asyncio.create_task(
            send_email(
                to=email,
                subject="Verify your email",
                body=f"Click to verify: {verify_url}",
            )
        )
        record(event="signup", user_id=user.id)
        return user

    def verify_email(self, token: str) -> User:
        ev = (
            self.db.query(EmailVerificationToken)
            .filter(
                EmailVerificationToken.token == token,
                EmailVerificationToken.expires_at > datetime.utcnow(),
            )
            .first()
        )
        if not ev:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )
        user = ev.user
        user.is_verified = True
        self.db.delete(ev)
        self.db.commit()
        record(event="email_verified", user_id=user.id)
        return user

    def login(self, email: str, password: str) -> dict:
        user = self._get_user_by_email(email)
        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified",
            )
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token()
        self.token_store.store_token(user_id=user.id, token=refresh_token)
        record(event="login", user_id=user.id)
        return {"access_token": access_token, "refresh_token": refresh_token}

    def refresh(self, refresh_token: str) -> dict:
        stored = self.token_store.verify_token(refresh_token)
        if not stored:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        # Rotate token
        self.token_store.revoke_token(stored.token_hash)
        new_refresh = create_refresh_token()
        self.token_store.store_token(user_id=stored.user_id, token=new_refresh)
        access_token = create_access_token(data={"sub": str(stored.user_id)})
        record(event="token_refresh", user_id=stored.user_id)
        return {"access_token": access_token, "refresh_token": new_refresh}

    def logout(self, refresh_token: str) -> None:
        stored = self.token_store.verify_token(refresh_token)
        if stored:
            self.token_store.revoke_token(stored.token_hash)
            record(event="logout", user_id=stored.user_id)
