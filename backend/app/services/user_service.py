from typing import Optional
from sqlmodel import Session, select

from ..models.user import User
from ..schemas.profile import ProfileUpdate

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.get(User, user_id)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def update_profile(db: Session, user_id: str, update: ProfileUpdate) -> User:
    user = db.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    if update.investment_goal is not None:
        user.investment_goal = update.investment_goal
    if update.risk_tolerance is not None:
        user.risk_tolerance = update.risk_tolerance
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def activate_user(db: Session, user_id: str) -> User:
    user = db.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    user.is_active = True
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
