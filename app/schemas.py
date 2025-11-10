from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, root_validator


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class TodoCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class TodoUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

    @root_validator
    def at_least_one_field(cls, values):
        if not any(values.get(field) is not None for field in ("title", "description", "completed")):
            raise ValueError("At least one field must be provided")
        return values


class TodoResponseSchema(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime

    class Config:
        orm_mode = True
