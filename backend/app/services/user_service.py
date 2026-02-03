from typing import Optional
from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.user import UserUpdate
from ..services.audit_service import record


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_profile(self, user_id: int, updates: UserUpdate) -> User:
        user = self.get_user(user_id)
        if not user:
            raise ValueError("User not found")
        for field, value in updates.dict(exclude_unset=True).items():
            setattr(user, field, value)
        self.db.commit()
        self.db.refresh(user)
        record(event="profile_update", user_id=user.id, details=updates.dict(exclude_unset=True))
        return user
