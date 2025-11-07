from typing import List

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import verify_token
from signal_engine import generate_signals
from utils import log_info

router = APIRouter(prefix="/api", dependencies=[Depends(verify_token)])


@router.post("/portfolios", response_model=schemas.PortfolioOut)
def create_portfolio(
    payload: schemas.PortfolioCreate,
    db: Session = Depends(get_db),
):
    """Create a new portfolio record in the database."""
    log_info(f"Creating portfolio for client {payload.client_id} by advisor {payload.advisor_id}")
    portfolio = models.Portfolio(
        client_id=payload.client_id,
        advisor_id=payload.advisor_id,
        name=payload.name,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


@router.get("/portfolios", response_model=List[schemas.PortfolioOut])
def list_portfolios(
    advisor_id: int,
    db: Session = Depends(get_db),
):
    """Return all portfolios assigned to a specific advisor."""
    portfolios = (
        db.query(models.Portfolio)
        .filter(models.Portfolio.advisor_id == advisor_id)
        .all()
    )
    if not portfolios:
        raise HTTPException(status_code=404, detail="No portfolios found for this advisor")
    return portfolios


@router.post("/holdings", response_model=schemas.HoldingOut)
def add_holding(
    payload: schemas.HoldingCreate,
    db: Session = Depends(get_db),
):
    """Add a holding to an existing portfolio."""
    # Ensure the portfolio exists
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == payload.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    holding = models.Holding(
        portfolio_id=payload.portfolio_id,
        symbol=payload.symbol,
        quantity=payload.quantity,
        average_price=payload.average_price,
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


@router.get("/portfolios/{portfolio_id}/signals", response_model=List[schemas.SignalOut])
def get_signals(
    portfolio_id: int,
    db: Session = Depends(get_db),
):
    """Fetch the latest signals for all symbols in the specified portfolio."""
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    # Retrieve distinct symbols from holdings belonging to the portfolio
    symbols = (
        db.query(models.Holding.symbol)
        .filter(models.Holding.portfolio_id == portfolio_id)
        .distinct()
        .all()
    )
    symbol_list = [s[0] for s in symbols]
    if not symbol_list:
        return []
    signals = (
        db.query(models.Signal)
        .filter(models.Signal.symbol.in_(symbol_list))
        .order_by(models.Signal.date.desc())
        .all()
    )
    return signals


@router.post("/signals/generate")
def trigger_signal_generation(
    symbols: List[str] = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """Manually trigger signal generation for a list of symbols.

    The underlying ``signal_engine.generate_signals`` function is expected to
    accept a list of symbols and a DB session, returning a dictionary with a
    summary of the operation.
    """
    if not symbols:
        raise HTTPException(status_code=400, detail="Symbol list cannot be empty")
    log_info(f"Manually triggering signal generation for symbols: {symbols}")
    result = generate_signals(symbols=symbols, db=db)
    return {"status": "success", "details": result}
