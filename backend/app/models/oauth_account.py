from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from ..db import Base

class OAuthAccount(Base):
    """Links an external OAuth provider to a local user.

    Currently only Google is supported, but the model is generic.
    """

    __tablename__ = "oauth_accounts"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)  # e.g., "google"
    provider_account_id = Column(String(255), nullable=False)  # Provider's user ID
    access_token = Column(String(512), nullable=True)
    refresh_token = Column(String(512), nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="oauth_accounts")
