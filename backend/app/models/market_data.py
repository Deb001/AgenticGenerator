from sqlalchemy import Column, String, Date, Float, PrimaryKeyConstraint
from app.db.base_class import Base


class MarketData(Base):
    """Historical OHLCV data for a ticker on a specific date.

    Composite primary key: (ticker, date).
    """

    __tablename__ = "market_data"
    __table_args__ = (PrimaryKeyConstraint("ticker", "date"),)

    ticker = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    def __repr__(self) -> str:
        return f"<MarketData ticker={self.ticker} date={self.date}>"
