from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    investment_goals: Optional[str] = None
    risk_tolerance: Optional[str] = None
    is_verified: bool

    class Config:
        orm_mode = True
        extra = "forbid"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    investment_goals: Optional[str] = None
    risk_tolerance: Optional[str] = None

    class Config:
        extra = "forbid"


class PortfolioSummary(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True
        extra = "forbid"


class UserWithPortfolios(UserProfile):
    portfolios: List[PortfolioSummary] = []

    class Config:
        orm_mode = True
        extra = "forbid"
