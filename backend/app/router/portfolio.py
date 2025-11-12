from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from backend.app.schemas import PortfolioCreate, PortfolioRead, HoldingCreate, HoldingRead
from backend.app.crud import get_portfolios_by_advisor, create_portfolio, add_holding
from backend.app.dependencies import advisor_required

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("/", response_model=List[PortfolioRead])
def list_portfolios(current_user = Depends(advisor_required), db: Session = Depends(lambda: None)):
    """Return all portfolios belonging to the authenticated advisor.
    """
    # The ``db`` dependency is injected manually because ``advisor_required`` already
    # depends on ``get_db``; we retrieve the session from the request state.
    from backend.app.dependencies import get_db
    db = next(get_db())
    portfolios = get_portfolios_by_advisor(db, current_user.id)
    return portfolios


@router.post("/", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_new_portfolio(portfolio_in: PortfolioCreate, current_user = Depends(advisor_required)):
    from backend.app.dependencies import get_db
    db = next(get_db())
    portfolio = create_portfolio(db, current_user.id, portfolio_in)
    return portfolio


@router.post("/{portfolio_id}/holdings", response_model=HoldingRead, status_code=status.HTTP_201_CREATED)
def add_holding_to_portfolio(
    portfolio_id: int,
    holding_in: HoldingCreate,
    current_user = Depends(advisor_required),
):
    from backend.app.dependencies import get_db
    db = next(get_db())
    # Verify ownership
    portfolios = get_portfolios_by_advisor(db, current_user.id)
    if not any(p.id == portfolio_id for p in portfolios):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    holding = add_holding(db, portfolio_id, holding_in)
    return holding