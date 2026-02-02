from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ..schemas import portfolio as portfolio_schema
from ..api.deps import get_current_user, get_db
from ..services import portfolio_service

router = APIRouter()


@router.post("/", response_model=portfolio_schema.PortfolioResponse)
def create_portfolio(
    payload: portfolio_schema.PortfolioCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = portfolio_service.create_portfolio(db, current_user.id, payload)
    return portfolio


@router.get("/", response_model=List[portfolio_schema.PortfolioResponse])
def list_portfolios(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return portfolio_service.get_user_portfolios(db, current_user.id)


@router.get("/{portfolio_id}", response_model=portfolio_schema.PortfolioResponse)
def get_portfolio(portfolio_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = portfolio_service.get_portfolio(db, current_user.id, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.put("/{portfolio_id}", response_model=portfolio_schema.PortfolioResponse)
def update_portfolio(
    portfolio_id: str,
    payload: portfolio_schema.PortfolioUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = portfolio_service.update_portfolio(db, current_user.id, portfolio_id, payload)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.delete("/{portfolio_id}", status_code=204)
def delete_portfolio(portfolio_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    success = portfolio_service.delete_portfolio(db, current_user.id, portfolio_id)
    if not success:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return None

# ----- Portfolio Items -----

@router.post("/{portfolio_id}/items", response_model=portfolio_schema.PortfolioItemResponse)
def add_item(
    portfolio_id: str,
    payload: portfolio_schema.PortfolioItemCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = portfolio_service.add_item(db, current_user.id, portfolio_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return item


@router.put("/{portfolio_id}/items/{item_id}", response_model=portfolio_schema.PortfolioItemResponse)
def update_item(
    portfolio_id: str,
    item_id: str,
    payload: portfolio_schema.PortfolioItemUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = portfolio_service.update_item(db, current_user.id, portfolio_id, item_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{portfolio_id}/items/{item_id}", status_code=204)
def delete_item(
    portfolio_id: str,
    item_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = portfolio_service.delete_item(db, current_user.id, portfolio_id, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return None
