from sqlmodel import SQLModel
from ..db.session import engine
from ..models.user import User, OAuthAccount
from ..models.portfolio import Portfolio, PortfolioItem, AuditLog

def init_db() -> None:
    """Create all tables if they do not already exist."""
    SQLModel.metadata.create_all(engine)
