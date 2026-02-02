from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select, selectinload

from ..models.portfolio import Portfolio, PortfolioItem
from ..schemas import portfolio as portfolio_schema

def create_portfolio(db: Session, user_id: UUID, payload: portfolio_schema.PortfolioCreate) -> portfolio_schema.PortfolioResponse:
    portfolio = Portfolio(user_id=user_id, name=payload.name, description=payload.description)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio_schema.PortfolioResponse.from_orm(portfolio)

def get_user_portfolios(db: Session, user_id: UUID) -> List[portfolio_schema.PortfolioResponse]:
    statement = (
        select(Portfolio)
        .where(Portfolio.user_id == user_id)
        .options(selectinload(Portfolio.items))
    )
    portfolios = db.exec(statement).all()
    return [portfolio_schema.PortfolioResponse.from_orm(p) for p in portfolios]

def get_portfolio(db: Session, user_id: UUID, portfolio_id: str) -> Optional[portfolio_schema.PortfolioResponse]:
    statement = (
        select(Portfolio)
        .where(Portfolio.id == portfolio_id)
        .options(selectinload(Portfolio.items))
    )
    portfolio = db.exec(statement).first()
    if not portfolio or portfolio.user_id != user_id:
        return None
    return portfolio_schema.PortfolioResponse.from_orm(portfolio)

def update_portfolio(db: Session, user_id: UUID, portfolio_id: str, payload: portfolio_schema.PortfolioUpdate) -> Optional[portfolio_schema.PortfolioResponse]:
    portfolio = db.get(Portfolio, portfolio_id)
    if not portfolio or portfolio.user_id != user_id:
        return None
    if payload.name is not None:
        portfolio.name = payload.name
    if payload.description is not None:
        portfolio.description = payload.description
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio_schema.PortfolioResponse.from_orm(portfolio)

def delete_portfolio(db: Session, user_id: UUID, portfolio_id: str) -> bool:
    portfolio = db.get(Portfolio, portfolio_id)
    if not portfolio or portfolio.user_id != user_id:
        return False
    db.delete(portfolio)
    db.commit()
    return True

# ----- Portfolio Items -----

def add_item(
    db: Session,
    user_id: UUID,
    portfolio_id: str,
    payload: portfolio_schema.PortfolioItemCreate,
) -> Optional[portfolio_schema.PortfolioItemResponse]:
    portfolio = db.get(Portfolio, portfolio_id)
    if not portfolio or portfolio.user_id != user_id:
        return None
    item = PortfolioItem(
        portfolio_id=portfolio.id,
        ticker=payload.ticker,
        quantity=payload.quantity,
        average_cost=payload.average_cost,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return portfolio_schema.PortfolioItemResponse.from_orm(item)

def update_item(
    db: Session,
    user_id: UUID,
    portfolio_id: str,
    item_id: str,
    payload: portfolio_schema.PortfolioItemUpdate,
) -> Optional[portfolio_schema.PortfolioItemResponse]:
    portfolio = db.get(Portfolio, portfolio_id)
    if not portfolio or portfolio.user_id != user_id:
        return None
    item = db.get(PortfolioItem, item_id)
    if not item or item.portfolio_id != portfolio.id:
        return None
    if payload.ticker is not None:
        item.ticker = payload.ticker
    if payload.quantity is not None:
        item.quantity = payload.quantity
    if payload.average_cost is not None:
        item.average_cost = payload.average_cost
    db.add(item)
    db.commit()
    db.refresh(item)
    return portfolio_schema.PortfolioItemResponse.from_orm(item)

def delete_item(db: Session, user_id: UUID, portfolio_id: str, item_id: str) -> bool:
    portfolio = db.get(Portfolio, portfolio_id)
    if not portfolio or portfolio.user_id != user_id:
        return False
    item = db.get(PortfolioItem, item_id)
    if not item or item.portfolio_id != portfolio.id:
        return False
    db.delete(item)
    db.commit()
    return True
