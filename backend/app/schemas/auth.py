from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=12, max_length=128)
    full_name: Optional[str] = None

    @validator("password")
    def _no_whitespace(cls, v: str) -> str:
        if " " in v:
            raise ValueError("Password must not contain spaces")
        return v

    @validator("password")
    def _complexity(cls, v: str) -> str:
        import re
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain a special character")
        return v

    class Config:
        extra = "forbid"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    class Config:
        extra = "forbid"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    class Config:
        extra = "forbid"


class OAuthCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None

    class Config:
        extra = "forbid"


class EmailVerificationRequest(BaseModel):
    token: str

    class Config:
        extra = "forbid"


class PasswordResetRequest(BaseModel):
    email: EmailStr

    class Config:
        extra = "forbid"


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=12, max_length=128)

    @validator("new_password")
    def _complexity(cls, v: str) -> str:
        import re
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain a special character")
        return v

    class Config:
        extra = "forbid"
