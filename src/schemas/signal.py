from pydantic import BaseModel
from typing import Literal
from datetime import date

class SignalRead(BaseModel):
    """Response model containing ticker, date, price, and recommendation."""

    ticker: str
    trade_date: date
    close_price: float
    recommendation: Literal["Buy", "Hold", "Sell"]

    class Config:
        orm_mode = True
