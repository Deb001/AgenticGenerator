from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    """Payload for registering a new advisor."""

    email: EmailStr
    password: str = Field(..., min_length=8)

class UserRead(BaseModel):
    """Returned user data (no password)."""

    id: int
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    """JWT access token response."""

    access_token: str
    token_type: str = "bearer"

class PortfolioCreate(BaseModel):
    """Payload to create a client portfolio."""

    client_name: str = Field(..., max_length=255)

class HoldingCreate(BaseModel):
    """Payload to add a holding."""

    ticker: str = Field(..., max_length=10)
    quantity: int = Field(..., gt=0)
    average_price: float = Field(..., gt=0)

class HoldingRead(BaseModel):
    """Holding data returned from API."""

    id: int
    ticker: str
    quantity: int
    average_price: float

    class Config:
        orm_mode = True

class PortfolioRead(BaseModel):
    """Portfolio data with holdings."""

    id: int
    client_name: str
    created_at: datetime
    holdings: List[HoldingRead] = []

    class Config:
        orm_mode = True

class SignalRead(BaseModel):
    """Advisory signal for a ticker."""

    ticker: str
    date: datetime
    signal: str
    explanation: Optional[str] = None

    class Config:
        orm_mode = True
