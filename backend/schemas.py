from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PortfolioCreate(BaseModel):
    """Payload for creating a new portfolio."""

    client_id: int = Field(..., description="Identifier of the client owning the portfolio")
    advisor_id: int = Field(..., description="Identifier of the advisor managing the portfolio")
    name: str = Field(..., description="Human readable name of the portfolio")


class PortfolioOut(BaseModel):
    """Response model for a portfolio record."""

    id: int
    client_id: int
    advisor_id: int
    name: str
    created_at: datetime

    class Config:
        orm_mode = True


class HoldingCreate(BaseModel):
    """Payload for adding a holding to a portfolio."""

    portfolio_id: int = Field(..., description="Portfolio to which the holding belongs")
    symbol: str = Field(..., description="Ticker symbol of the security")
    quantity: float = Field(..., gt=0, description="Number of shares/units held")
    average_price: float = Field(..., gt=0, description="Average acquisition price per unit")


class HoldingOut(BaseModel):
    """Response model for a holding record."""

    id: int
    portfolio_id: int
    symbol: str
    quantity: float
    average_price: float
    created_at: datetime

    class Config:
        orm_mode = True


class SignalOut(BaseModel):
    """Response model for a generated signal."""

    symbol: str
    date: datetime
    recommendation: str
    provenance: str

    class Config:
        orm_mode = True
