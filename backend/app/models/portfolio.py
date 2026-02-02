from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

class Portfolio(SQLModel, table=True):
    """A collection of investment items belonging to a user."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner: Optional["User"] = Relationship(back_populates="portfolios")
    items: List["PortfolioItem"] = Relationship(back_populates="portfolio")

class PortfolioItem(SQLModel, table=True):
    """A single holding within a portfolio (e.g., a stock ticker)."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    portfolio_id: UUID = Field(foreign_key="portfolio.id")
    ticker: str
    quantity: float
    average_cost: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    portfolio: Optional[Portfolio] = Relationship(back_populates="items")

class AuditLog(SQLModel, table=True):
    """Simple audit log for security‑relevant events."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    event_type: str
    description: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="audit_logs")
