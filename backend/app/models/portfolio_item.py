from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..db import Base

class PortfolioItem(Base):
    """A single holding within a portfolio.

    For simplicity we store ticker symbol, quantity and optional purchase price.
    """

    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(20), nullable=False)
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=True)
    portfolio_id = Column(
        Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="items")
