from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db import get_session
from backend.models import ClientPortfolio, Holding, User
from backend.schemas import PortfolioCreate, PortfolioRead, HoldingCreate, HoldingRead
from backend.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    payload: PortfolioCreate,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> PortfolioRead:
    """Create a new ``ClientPortfolio`` linked to the authenticated advisor.
    """
    try:
        portfolio = ClientPortfolio(name=payload.name, advisor_id=user.id)
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        return PortfolioRead.from_orm(portfolio)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create portfolio")

@router.get("/", response_model=List[PortfolioRead])
def list_portfolios(
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> List[PortfolioRead]:
    """Return all portfolios owned by the authenticated advisor.
    """
    portfolios = db.query(ClientPortfolio).filter(ClientPortfolio.advisor_id == user.id).all()
    return [PortfolioRead.from_orm(p) for p in portfolios]

@router.get("/{portfolio_id}", response_model=PortfolioRead)
def get_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> PortfolioRead:
    """Fetch a single portfolio with its holdings.
    """
    portfolio = (
        db.query(ClientPortfolio)
        .filter(ClientPortfolio.id == portfolio_id)
        .first()
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if portfolio.advisor_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this portfolio")
    # Eagerly load holdings (assuming relationship defined)
    return PortfolioRead.from_orm(portfolio)

@router.post("/{portfolio_id}/holdings", response_model=HoldingRead, status_code=status.HTTP_201_CREATED)
def add_holding(
    portfolio_id: int,
    payload: HoldingCreate,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> HoldingRead:
    """Add a holding to a portfolio after verifying ownership.
    """
    portfolio = (
        db.query(ClientPortfolio)
        .filter(ClientPortfolio.id == portfolio_id)
        .first()
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if portfolio.advisor_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this portfolio")
    try:
        holding = Holding(
            portfolio_id=portfolio.id,
            ticker=payload.ticker,
            quantity=payload.quantity,
            average_price=payload.average_price,
        )
        db.add(holding)
        db.commit()
        db.refresh(holding)
        return HoldingRead.from_orm(holding)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add holding")