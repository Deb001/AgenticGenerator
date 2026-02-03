from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from ..models.portfolio import Portfolio
from ..models.portfolio_item import PortfolioItem
from ..schemas.portfolio import (
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioItemCreate,
    PortfolioItemUpdate,
)
from ..services.audit_service import record


class PortfolioService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def list_portfolios(self) -> List[Portfolio]:
        return (
            self.db.query(Portfolio)
            .options(joinedload(Portfolio.items))
            .filter(Portfolio.owner_id == self.user_id)
            .all()
        )

    def get_portfolio(self, portfolio_id: int) -> Optional[Portfolio]:
        return (
            self.db.query(Portfolio)
            .options(joinedload(Portfolio.items))
            .filter(Portfolio.id == portfolio_id, Portfolio.owner_id == self.user_id)
            .first()
        )

    def create_portfolio(self, data: PortfolioCreate) -> Portfolio:
        portfolio = Portfolio(
            name=data.name, description=data.description, owner_id=self.user_id
        )
        self.db.add(portfolio)
        self.db.commit()
        self.db.refresh(portfolio)
        record(event="portfolio_create", user_id=self.user_id, details={"portfolio_id": portfolio.id})
        return portfolio

    def update_portfolio(self, portfolio_id: int, data: PortfolioUpdate) -> Portfolio:
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio:
            raise ValueError("Portfolio not found")
        for field, value in data.dict(exclude_unset=True).items():
            setattr(portfolio, field, value)
        self.db.commit()
        self.db.refresh(portfolio)
        record(event="portfolio_update", user_id=self.user_id, details={"portfolio_id": portfolio.id})
        return portfolio

    def delete_portfolio(self, portfolio_id: int) -> None:
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio:
            raise ValueError("Portfolio not found")
        self.db.delete(portfolio)
        self.db.commit()
        record(event="portfolio_delete", user_id=self.user_id, details={"portfolio_id": portfolio.id})

    # Portfolio items – direct queries avoid N+1 loading.
    def list_items(self, portfolio_id: int) -> List[PortfolioItem]:
        # Verify ownership first.
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio:
            raise ValueError("Portfolio not found")
        return (
            self.db.query(PortfolioItem)
            .filter(PortfolioItem.portfolio_id == portfolio_id)
            .all()
        )

    def add_item(self, portfolio_id: int, data: PortfolioItemCreate) -> PortfolioItem:
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio:
            raise ValueError("Portfolio not found")
        item = PortfolioItem(
            ticker=data.ticker,
            quantity=data.quantity,
            purchase_price=data.purchase_price,
            portfolio_id=portfolio.id,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        record(
            event="portfolio_item_add",
            user_id=self.user_id,
            details={"portfolio_id": portfolio.id, "item_id": item.id},
        )
        return item

    def update_item(
        self, portfolio_id: int, item_id: int, data: PortfolioItemUpdate
    ) -> PortfolioItem:
        item = (
            self.db.query(PortfolioItem)
            .join(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == self.user_id,
                PortfolioItem.id == item_id,
            )
            .first()
        )
        if not item:
            raise ValueError("Item not found")
        for field, value in data.dict(exclude_unset=True).items():
            setattr(item, field, value)
        self.db.commit()
        self.db.refresh(item)
        record(
            event="portfolio_item_update",
            user_id=self.user_id,
            details={"portfolio_id": portfolio_id, "item_id": item.id},
        )
        return item

    def delete_item(self, portfolio_id: int, item_id: int) -> None:
        item = (
            self.db.query(PortfolioItem)
            .join(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == self.user_id,
                PortfolioItem.id == item_id,
            )
            .first()
        )
        if not item:
            raise ValueError("Item not found")
        self.db.delete(item)
        self.db.commit()
        record(
            event="portfolio_item_delete",
            user_id=self.user_id,
            details={"portfolio_id": portfolio_id, "item_id": item.id},
        )
