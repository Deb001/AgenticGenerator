from src.db import Session
from src.models.user import User
from src.schemas.user import UserRead, UserUpdate
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status

def get_user_by_id(db: Session, user_id: int) -> UserRead:
    """Fetch a user by ID and return a ``UserRead`` schema.

    Raises 404 if the user does not exist.
    """
    user = db.query(User).options(joinedload(User.portfolios)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserRead.from_orm(user)

def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[UserRead]:
    """Return a paginated list of users as ``UserRead`` schemas."""
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserRead.from_orm(u) for u in users]

def update_user_role(db: Session, user_id: int, role: str, is_active: bool) -> UserRead:
    """Admin operation to change a user's role and activation status.

    Validates the role against allowed literals.
    """
    if role not in {"client", "advisor", "admin"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = role
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return UserRead.from_orm(user)

def delete_user(db: Session, user_id: int) -> None:
    """Soft‑delete a user by setting ``is_active`` to ``False``.

    Raises 404 if the user does not exist.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
