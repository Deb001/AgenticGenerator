from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class User(Base):
    """ORM model for application users.

    Attributes:
        id: Primary key.
        email: Unique email address.
        full_name: User's full name.
        hashed_password: Bcrypt hash of the password.
        is_active: Whether the user account is active.
        is_advisor: Flag indicating advisor role.
        created_at: Timestamp of creation.
        portfolios: Relationship to Portfolio (one‑to‑many).
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_advisor = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    portfolios = relationship("Portfolio", back_populates="advisor", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} advisor={self.is_advisor}>"
