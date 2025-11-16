from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models
from app.crud import (
    create_portfolio,
    get_portfolio,
    list_portfolios,
    create_holding,
    list_holdings,
)
from app.api.dependencies import get_db
from app.auth import get_current_advisor

router = APIRouter()

@router.get("/", response_model=List[schemas.PortfolioRead])
def read_portfolios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), advisor=Depends(get_current_advisor)):
    portfolios = list_portfolios(db, skip=skip, limit=limit)
    return portfolios

@router.post("/", response_model=schemas.PortfolioRead)
def create_new_portfolio(payload: schemas.PortfolioCreate, db: Session = Depends(get_db), advisor=Depends(get_current_advisor)):
    portfolio = create_portfolio(db, client_id=payload.client_id, name=payload.name)
    return portfolio

@router.get("/{portfolio_id}", response_model=schemas.PortfolioRead)
def read_portfolio(portfolio_id: int, db: Session = Depends(get_db), advisor=Depends(get_current_advisor)):
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.post("/{portfolio_id}/holdings", response_model=schemas.HoldingRead)
def add_holding(portfolio_id: int, payload: schemas.HoldingCreate, db: Session = Depends(get_db), advisor=Depends(get_current_advisor)):
    # Ensure portfolio exists
    if not get_portfolio(db, portfolio_id):
        raise HTTPException(status_code=404, detail="Portfolio not found")
    holding = create_holding(
        db,
        portfolio_id=portfolio_id,
        ticker=payload.ticker,
        quantity=payload.quantity,
        avg_price=payload.avg_price,
    )
    return holding

@router.get("/{portfolio_id}/holdings", response_model=List[schemas.HoldingRead])
def get_holdings(portfolio_id: int, db: Session = Depends(get_db), advisor=Depends(get_current_advisor)):
    if not get_portfolio(db, portfolio_id):
        raise HTTPException(status_code=404, detail="Portfolio not found")
    holdings = list_holdings(db, portfolio_id)
    return holdings
