from pydantic import BaseModel, validator
import re

class HoldingCreate(BaseModel):
    """Payload for adding a new holding."""

    ticker: str
    quantity: float
    avg_price: float

    @validator("ticker")
    def ticker_uppercase(cls, v: str) -> str:
        v = v.upper()
        if not re.fullmatch(r"^[A-Z]{1,5}$", v):
            raise ValueError("Ticker must be 1-5 uppercase letters")
        return v

    @validator("quantity")
    def quantity_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v

    @validator("avg_price")
    def avg_price_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Average price cannot be negative")
        return v

class HoldingRead(BaseModel):
    """Response model for a holding."""

    id: int
    ticker: str
    quantity: float
    avg_price: float
    created_at: str

    class Config:
        orm_mode = True

class HoldingUpdate(BaseModel):
    """Payload for updating quantity or avg_price of a holding."""

    quantity: float | None = None
    avg_price: float | None = None

    @validator("quantity")
    def quantity_positive(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v

    @validator("avg_price")
    def avg_price_non_negative(cls, v: float | None) -> float | None:
        if v is not None and v < 0:
            raise ValueError("Average price cannot be negative")
        return v
