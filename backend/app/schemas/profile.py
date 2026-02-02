from pydantic import BaseModel
from typing import Optional

class ProfileResponse(BaseModel):
    email: str
    investment_goal: Optional[str] = None
    risk_tolerance: Optional[str] = None
    is_verified: bool

    class Config:
        orm_mode = True

class ProfileUpdate(BaseModel):
    investment_goal: Optional[str] = None
    risk_tolerance: Optional[str] = None
