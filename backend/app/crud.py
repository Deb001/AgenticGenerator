from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models import User, Portfolio, Holding, PriceHistory, Sector
from backend.app.schemas import UserCreate, PortfolioCreate, HoldingCreate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Return a user instance matching the given email or ``None`` if not found."""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate, hashed_password: str) -> User:
    """Create a new user record.

    Raises:
        HTTPException: 400 if the email already exists.
    """
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=user_in.email, hashed_password=hashed_password, is_advisor=user_in.is_advisor)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Validate credentials and return the user if authentication succeeds.

    The password verification is delegated to ``backend.app.auth.verify_password``.
    """
    from backend.app.auth import verify_password

    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_portfolios_by_advisor(db: Session, advisor_id: int) -> List[Portfolio]:
    """Return all portfolios owned by the advisor with ``advisor_id``."""
    return db.query(Portfolio).filter(Portfolio.advisor_id == advisor_id).all()


def create_portfolio(db: Session, advisor_id: int, portfolio_in: PortfolioCreate) -> Portfolio:
    """Create a new portfolio for the given advisor.

    Raises:
        HTTPException: 400 if a portfolio with the same name already exists for the advisor.
    """
    existing = (
        db.query(Portfolio)
        .filter(Portfolio.advisor_id == advisor_id, Portfolio.name == portfolio_in.name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Portfolio name already exists")
    portfolio = Portfolio(name=portfolio_in.name, advisor_id=advisor_id)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def add_holding(db: Session, portfolio_id: int, holding_in: HoldingCreate) -> Holding:
    """Add a holding to a portfolio.

    Raises:
        HTTPException: 404 if the portfolio does not exist.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    holding = Holding(portfolio_id=portfolio_id, ticker=holding_in.ticker, quantity=holding_in.quantity)
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


def get_price_history(db: Session, ticker: str, days: int = 90) -> List[PriceHistory]:
    """Return the most recent ``days`` price records for ``ticker`` ordered by date descending."""
    return (
        db.query(PriceHistory)
        .filter(PriceHistory.ticker == ticker)
        .order_by(PriceHistory.date.desc())
        .limit(days)
        .all()
    )


def get_sector_by_ticker(db: Session, ticker: str) -> Optional[Sector]:
    """Return the sector record for a ticker, or ``None`` if not found."""
    return db.query(Sector).filter(Sector.ticker == ticker).first()