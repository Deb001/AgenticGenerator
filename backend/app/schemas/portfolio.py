from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, conint, constr


class PortfolioCreate(BaseModel):
    name: constr(min_length=1, max_length=255)
    description: Optional[str] = None

    class Config:
        extra = "forbid"


class PortfolioUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=255)] = None
    description: Optional[str] = None

    class Config:
        extra = "forbid"


class PortfolioRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        extra = "forbid"


class PortfolioItemCreate(BaseModel):
    ticker: constr(min_length=1, max_length=20)
    quantity: float = Field(..., gt=0)
    purchase_price: Optional[float] = None

    class Config:
        extra = "forbid"


class PortfolioItemUpdate(BaseModel):
    ticker: Optional[constr(min_length=1, max_length=20)] = None
    quantity: Optional[float] = Field(None, gt=0)
    purchase_price: Optional[float] = None

    class Config:
        extra = "forbid"


class PortfolioItemRead(BaseModel):
    id: int
    ticker: str
    quantity: float
    purchase_price: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        extra = "forbid"


class PortfolioDetail(PortfolioRead):
    items: List[PortfolioItemRead] = []

    class Config:
        orm_mode = True
        extra = "forbid"
