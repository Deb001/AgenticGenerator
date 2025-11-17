from src.db import Session
from src.models.portfolio import Portfolio
from src.models.holding import Holding
from src.schemas.portfolio import PortfolioCreate, PortfolioRead, PortfolioUpdate
from src.schemas.holding import HoldingCreate, HoldingRead, HoldingUpdate
from src.utils.logger import logger
from src.utils.validation import validate_ticker, validate_positive_float
from fastapi import HTTPException, status

def _check_permission(portfolio: Portfolio, requester_id: int, requester_role: str) -> None:
    """Internal helper to enforce RBAC for portfolio access.

    Advisors have blanket access in this MVP; clients must own the portfolio.
    """
    if requester_role == "advisor":
        return
    if requester_role == "client" and portfolio.owner_id != requester_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions for this portfolio")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

def create_portfolio(db: Session, owner_id: int, portfolio_in: PortfolioCreate) -> PortfolioRead:
    """Create a new portfolio for a client and return its read schema."""
    portfolio = Portfolio(name=portfolio_in.name, owner_id=owner_id)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    logger.info("Portfolio created", extra={"owner_id": owner_id, "portfolio_id": portfolio.id})
    return PortfolioRead.from_orm(portfolio)

def get_portfolio(db: Session, portfolio_id: int, requester_id: int, requester_role: str) -> PortfolioRead:
    """Retrieve a portfolio with its holdings after RBAC check."""
    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id)
        .first()
    )
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    _check_permission(portfolio, requester_id, requester_role)
    # Eager load holdings
    portfolio.holdings  # relationship is lazy‑loaded; accessing triggers load
    return PortfolioRead.from_orm(portfolio)

def update_portfolio(db: Session, portfolio_id: int, updates: PortfolioUpdate, requester_id: int, requester_role: str) -> PortfolioRead:
    """Update portfolio name or active flag after permission validation."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    _check_permission(portfolio, requester_id, requester_role)
    if updates.name is not None:
        portfolio.name = updates.name
    if updates.is_active is not None:
        portfolio.is_active = updates.is_active
    db.commit()
    db.refresh(portfolio)
    logger.info("Portfolio updated", extra={"portfolio_id": portfolio.id, "requester_id": requester_id})
    return PortfolioRead.from_orm(portfolio)

def delete_portfolio(db: Session, portfolio_id: int, requester_id: int, requester_role: str) -> None:
    """Soft‑delete a portfolio by setting ``is_active`` to ``False``."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    _check_permission(portfolio, requester_id, requester_role)
    portfolio.is_active = False
    db.commit()
    logger.info("Portfolio soft‑deleted", extra={"portfolio_id": portfolio.id, "requester_id": requester_id})

def add_holding(db: Session, portfolio_id: int, holding_in: HoldingCreate, requester_id: int, requester_role: str) -> HoldingRead:
    """Add a new ticker holding to a portfolio after validation and permission checks."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    _check_permission(portfolio, requester_id, requester_role)
    # Validate ticker and numeric fields using shared helpers
    ticker = validate_ticker(holding_in.ticker)
    quantity = validate_positive_float(holding_in.quantity, "quantity")
    avg_price = holding_in.avg_price if holding_in.avg_price >= 0 else 0.0
    holding = Holding(
        portfolio_id=portfolio_id,
        ticker=ticker,
        quantity=quantity,
        avg_price=avg_price,
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    logger.info("Holding added", extra={"portfolio_id": portfolio_id, "holding_id": holding.id})
    return HoldingRead.from_orm(holding)

def update_holding(db: Session, holding_id: int, updates: HoldingUpdate, requester_id: int, requester_role: str) -> HoldingRead:
    """Update quantity or average price of an existing holding after permission validation."""
    holding = db.query(Holding).filter(Holding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found")
    portfolio = db.query(Portfolio).filter(Portfolio.id == holding.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated portfolio not found")
    _check_permission(portfolio, requester_id, requester_role)
    if updates.quantity is not None:
        holding.quantity = validate_positive_float(updates.quantity, "quantity")
    if updates.avg_price is not None:
        if updates.avg_price < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Average price cannot be negative")
        holding.avg_price = updates.avg_price
    db.commit()
    db.refresh(holding)
    logger.info("Holding updated", extra={"holding_id": holding.id, "requester_id": requester_id})
    return HoldingRead.from_orm(holding)

def remove_holding(db: Session, holding_id: int, requester_id: int, requester_role: str) -> None:
    """Delete a holding after permission check."""
    holding = db.query(Holding).filter(Holding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found")
    portfolio = db.query(Portfolio).filter(Portfolio.id == holding.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated portfolio not found")
    _check_permission(portfolio, requester_id, requester_role)
    db.delete(holding)
    db.commit()
    logger.info("Holding removed", extra={"holding_id": holding_id, "requester_id": requester_id})
