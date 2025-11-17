from pydantic import BaseModel, validator
from typing import List, Optional
from src.schemas.holding import HoldingRead

class PortfolioCreate(BaseModel):
    """Payload for creating a portfolio."""

    name: str

    @validator("name")
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Portfolio name cannot be empty")
        return v

class PortfolioUpdate(BaseModel):
    """Payload for updating portfolio name or active flag."""

    name: Optional[str] = None
    is_active: Optional[bool] = None

    @validator("name")
    def name_strip(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Portfolio name cannot be empty")
        return v

class PortfolioRead(BaseModel):
    """Response model including list of holdings."""

    id: int
    name: str
    owner_id: int
    is_active: bool
    created_at: str
    holdings: List[HoldingRead] = []

    class Config:
        orm_mode = True
