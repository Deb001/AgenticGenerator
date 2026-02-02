from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

class User(SQLModel, table=True):
    """Core user model.

    Includes optional profile fields (investment goal and risk tolerance) and
    relationships to OAuth accounts, portfolios, and audit logs.
    """

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: Optional[str] = None
    is_active: bool = Field(default=False)
    is_verified: bool = Field(default=False)
    investment_goal: Optional[str] = None
    risk_tolerance: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    oauth_accounts: List[OAuthAccount] = Relationship(back_populates="user")
    portfolios: List["Portfolio"] = Relationship(back_populates="owner")
    audit_logs: List["AuditLog"] = Relationship(back_populates="user")

class OAuthAccount(SQLModel, table=True):
    """External OAuth provider linkage.

    ``provider`` is a string like ``google``. ``provider_account_id`` stores the
    identifier returned by the provider.
    """

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    provider: str
    provider_account_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

    user: Optional[User] = Relationship(back_populates="oauth_accounts")
