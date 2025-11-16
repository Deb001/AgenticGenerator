from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class PortfolioCreate(BaseModel):
    client_id: int
    name: str

class PortfolioRead(BaseModel):
    id: int
    client_id: int
    name: str
    created_at: datetime
    holdings: List["HoldingRead"] = []

    class Config:
        orm_mode = True

class HoldingCreate(BaseModel):
    portfolio_id: int
    ticker: str
    quantity: float
    avg_price: float

class HoldingRead(BaseModel):
    id: int
    portfolio_id: int
    ticker: str
    quantity: float
    avg_price: float

    class Config:
        orm_mode = True

class HistoricalPriceRead(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    source: str

    class Config:
        orm_mode = True

class AdvisorySignalRead(BaseModel):
    id: int
    portfolio_id: int
    ticker: str
    date: datetime
    signal: str
    rationale: str

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class IndicatorResponse(BaseModel):
    sma_20: List[float]
    ema_20: List[float]
    rsi_14: List[float]
    macd_line: List[float]
    macd_signal: List[float]
    macd_histogram: List[float]
    dates: List[datetime]

class GenerateSignalRequest(BaseModel):
    ticker: str
    date: datetime

# Resolve forward references
PortfolioRead.update_forward_refs()