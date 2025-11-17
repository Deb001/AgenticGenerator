from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class HoldingRead(BaseModel):
    """Read‑only representation of a holding."""

    id: int
    ticker: str
    quantity: float
    avg_price: float
    last_price: Optional[float] = None

    class Config:
        orm_mode = True


class TransactionRead(BaseModel):
    """Read‑only representation of a transaction."""

    id: int
    transaction_type: str
    quantity: float
    price: float
    timestamp: str

    class Config:
        orm_mode = True


class PortfolioRead(BaseModel):
    """Portfolio with nested holdings and transactions."""

    id: int
    client_name: str
    advisor_id: int
    created_at: str
    holdings: List[HoldingRead] = []

    class Config:
        orm_mode = True


class PortfolioCreate(BaseModel):
    """Payload for creating a new portfolio."""

    client_name: str = Field(..., min_length=1)
