from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    password: str
    is_advisor: bool = False


class UserRead(BaseModel):
    id: int
    email: str
    is_active: bool
    is_advisor: bool

    class Config:
        orm_mode = True


class PortfolioCreate(BaseModel):
    name: str


class HoldingCreate(BaseModel):
    ticker: str
    quantity: int


class HoldingRead(BaseModel):
    id: int
    ticker: str
    quantity: int

    class Config:
        orm_mode = True


class PortfolioRead(BaseModel):
    id: int
    name: str
    holdings: List[HoldingRead] = []

    class Config:
        orm_mode = True


class AdvisorySignal(BaseModel):
    ticker: str
    signal: str  # "Buy", "Sell", or "Hold"
    confidence: float


class AdvisoryResponse(BaseModel):
    portfolio_id: int
    signals: List[AdvisorySignal]