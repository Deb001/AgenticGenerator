from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

class PortfolioItemCreate(BaseModel):
    ticker: str
    quantity: float = Field(..., gt=0)
    average_cost: float = Field(..., gt=0)

class PortfolioItemUpdate(BaseModel):
    ticker: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    average_cost: Optional[float] = Field(None, gt=0)

class PortfolioItemResponse(BaseModel):
    id: UUID
    ticker: str
    quantity: float
    average_cost: float

    class Config:
        orm_mode = True

class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class PortfolioResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    items: List[PortfolioItemResponse] = []

    class Config:
        orm_mode = True
