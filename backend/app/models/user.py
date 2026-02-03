from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship

from ..db import Base

class User(Base):
    """SQLAlchemy model representing an application user.

    Attributes:
        id: Primary key.
        email: Unique email address used for login.
        password_hash: Argon2 hash of the password (nullable for OAuth‑only accounts).
        full_name: Optional display name.
        investment_goals: Optional free‑form text describing goals.
        risk_tolerance: Optional free‑form text (e.g., "low", "medium", "high").
        is_active: Whether the account is active.
        is_verified: Whether the email address has been verified.
        created_at / updated_at: Timestamps.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    investment_goals = Column(Text, nullable=True)
    risk_tolerance = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    oauth_accounts = relationship(
        "OAuthAccount", back_populates="user", cascade="all, delete-orphan"
    )
    portfolios = relationship(
        "Portfolio", back_populates="owner", cascade="all, delete-orphan"
    )
    auth_tokens = relationship(
        "AuthToken", back_populates="user", cascade="all, delete-orphan"
    )
    email_verifications = relationship(
        "EmailVerificationToken", back_populates="user", cascade="all, delete-orphan"
    )
