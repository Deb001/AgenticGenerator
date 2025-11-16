from datetime import datetime
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

# User CRUD ---------------------------------------------------------------

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Return a User instance matching the given email or None."""
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, email: str, password: str) -> models.User:
    """Create a new user with a hashed password and return the instance."""
    hashed = get_password_hash(password)
    user = models.User(email=email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Portfolio CRUD -----------------------------------------------------------

def create_portfolio(db: Session, client_id: int, name: str) -> models.Portfolio:
    portfolio = models.Portfolio(client_id=client_id, name=name)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio

def get_portfolio(db: Session, portfolio_id: int) -> Optional[models.Portfolio]:
    return db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()

def list_portfolios(db: Session, skip: int = 0, limit: int = 100) -> List[models.Portfolio]:
    return db.query(models.Portfolio).offset(skip).limit(limit).all()

# Holding CRUD -------------------------------------------------------------

def create_holding(db: Session, portfolio_id: int, ticker: str, quantity: float, avg_price: float) -> models.Holding:
    holding = models.Holding(
        portfolio_id=portfolio_id,
        ticker=ticker,
        quantity=quantity,
        avg_price=avg_price,
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding

def list_holdings(db: Session, portfolio_id: int) -> List[models.Holding]:
    return db.query(models.Holding).filter(models.Holding.portfolio_id == portfolio_id).all()

# Historical price CRUD ----------------------------------------------------

def get_historical_prices(
    db: Session,
    ticker: str,
    start: datetime,
    end: datetime,
) -> List[Tuple[datetime, float]]:
    """Return a list of (date, close) tuples for the ticker between start and end."""
    rows = (
        db.query(models.HistoricalPrice.date, models.HistoricalPrice.close)
        .filter(models.HistoricalPrice.ticker == ticker)
        .filter(models.HistoricalPrice.date >= start)
        .filter(models.HistoricalPrice.date <= end)
        .order_by(models.HistoricalPrice.date)
        .all()
    )
    return rows

# Sector potential ----------------------------------------------------------

def get_sector_potential(db: Session, ticker: str) -> float:
    """Return the sector potential score for the sector that the ticker belongs to.
    If the ticker cannot be linked to a sector, a neutral score of 0.5 is returned.
    """
    holding = db.query(models.Holding).filter(models.Holding.ticker == ticker).first()
    if not holding:
        return 0.5
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == holding.portfolio_id).first()
    if not portfolio:
        return 0.5
    client = db.query(models.Client).filter(models.Client.id == portfolio.client_id).first()
    if not client or not client.sector:
        return 0.5
    return float(client.sector.potential_score)

# AdvisorySignal CRUD ------------------------------------------------------

def create_advisory_signal(db: Session, signal: models.AdvisorySignal) -> models.AdvisorySignal:
    db.add(signal)
    db.commit()
    db.refresh(signal)
    return signal

def list_signals_by_portfolio(db: Session, portfolio_id: int) -> List[models.AdvisorySignal]:
    return (
        db.query(models.AdvisorySignal)
        .filter(models.AdvisorySignal.portfolio_id == portfolio_id)
        .order_by(models.AdvisorySignal.date.desc())
        .all()
    )
