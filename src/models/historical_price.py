from src.db import Base
from sqlalchemy import Column, Integer, String, Float, Date, UniqueConstraint

class HistoricalPrice(Base):
    """ORM model storing daily OHLCV data for Indian equities."""

    __tablename__ = "historical_prices"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False, index=True)
    trade_date = Column(Date, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    __table_args__ = (UniqueConstraint("ticker", "trade_date", name="uq_ticker_date"),)
