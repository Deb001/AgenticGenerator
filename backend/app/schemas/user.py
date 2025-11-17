from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    """Payload for creating a new user."""

    email: EmailStr
    full_name: str = Field(..., min_length=1)
    password: str = Field(..., min_length=8)
    is_advisor: bool = False


class UserRead(BaseModel):
    """Response model exposing user data without password."""

    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    is_advisor: bool
    created_at: str

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    """Payload for partial user updates (all fields optional)."""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    is_advisor: Optional[bool] = None
