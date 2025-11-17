from pydantic import BaseModel, EmailStr, validator
from typing import Literal

class UserCreate(BaseModel):
    """Schema for user registration payload."""

    email: EmailStr
    password: str
    full_name: str | None = None
    role: Literal["client", "advisor", "admin"] = "client"

    @validator("password")
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

class UserRead(BaseModel):
    """Schema for returning user data (excluding password)."""

    id: int
    email: EmailStr
    full_name: str | None = None
    is_active: bool
    role: Literal["client", "advisor", "admin"]
    created_at: str

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    """Schema for admin updates to a user."""

    role: Literal["client", "advisor", "admin"] | None = None
    is_active: bool | None = None
