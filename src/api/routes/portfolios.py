from fastapi import APIRouter, Depends, HTTPException, status
from src.schemas.portfolio import PortfolioCreate, PortfolioRead, PortfolioUpdate
from src.schemas.holding import HoldingCreate, HoldingRead, HoldingUpdate
from src.services.portfolio_service import (
    create_portfolio,
    get_portfolio,
    update_portfolio,
    delete_portfolio,
    add_holding,
    update_holding,
    remove_holding,
)
from src.api.dependencies import get_db_dependency, get_current_user
from src.db import Session
from src.models.user import User

router = APIRouter(prefix="/portfolios", tags=["portfolios"])

@router.post("", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_portfolio_endpoint(
    portfolio_in: PortfolioCreate,
    db: Session = Depends(get_db_dependency),
    current_user: User = Depends(get_current_user),
):
    return create_portfolio(db, current_user.id, portfolio_in)

@router.get("/{portfolio_id}", response_model=PortfolioRead)
def get_portfolio_endpoint(
    portfolio_id: int,
    db: Session = Depends(get_db_dependency),
    current_user: User = Depends(get_current_user),
):
    return get_portfolio(db, portfolio_id, current_user.id, current_user.role)

@router.patch("/{portfolio_id}", response_model=PortfolioRead)
def update_portfolio_endpoint(
    portfolio_id: int,
    updates: PortfolioUpdate,
    db: Session = Depends(get_db_dependency),
    current_user: User = Depends(get_current_user),
):
    return update_portfolio(db, portfolio_id, updates, current_user.id, current_user.role)

@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_endpoint(
    portfolio_id: int,
    db: Session = Depends(get_db_dependency),
    current_user: User = Depends(get_current_user),
):
    delete_portfolio(db, portfolio_id, current_user.id, current_user.role)
    return None

# Holdings sub‑routes
@router.post("/{portfolio_id}/holdings", response_model=HoldingRead, status_code=status.HTTP_201_CREATED)
def add_holding_endpoint(
    portfolio_id: int,
    holding_in: HoldingCreate,
    db: Session = Depends(get_db_dependency),
    current_user: User = Depends(get_current_user),
):
    return add_holding(db, portfolio_id, holding_in, current_user.id, current_user.role)

@router.patch("/holdings/{holding_id}", response_model=HoldingRead)
def update_holding_endpoint(
    holding_id: int,
    updates: HoldingUpdate,
    db: Session = Depends(get_db_dependency),
    current_user: User = Depends(get_current_user),
):
    return update_holding(db, holding_id, updates, current_user.id, current_user.role)

@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holding_endpoint(
    holding_id: int,
    db: Session = Depends(get_db_dependency),
    current_user: User = Depends(get_current_user),
):
    remove_holding(db, holding_id, current_user.id, current_user.role)
    return None
