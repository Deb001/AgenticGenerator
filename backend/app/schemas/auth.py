from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Response model containing the JWT access token."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded token payload used internally."""

    user_id: int | None = None


class LoginRequest(BaseModel):
    """Payload for the login endpoint."""

    email: EmailStr
    password: str
