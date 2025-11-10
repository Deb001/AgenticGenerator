from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.db import Base

class User(Base):
    """Advisor user account model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="advisor")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # One advisor can have many client portfolios.
    portfolios = relationship(
        "ClientPortfolio",
        back_populates="advisor",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"

class ClientPortfolio(Base):
    """Portfolio belonging to a client."""

    __tablename__ = "client_portfolios"

    id = Column(Integer, primary_key=True, index=True)
    advisor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    client_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    advisor = relationship("User", back_populates="portfolios")
    holdings = relationship(
        "Holding",
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<ClientPortfolio id={self.id} client_name={self.client_name}>"

class Holding(Base):
    """Individual equity holding within a portfolio."""

    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("client_portfolios.id", ondelete="CASCADE"), nullable=False)
    ticker = Column(String, nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    average_price = Column(Float, nullable=False)

    portfolio = relationship("ClientPortfolio", back_populates="holdings")

    def __repr__(self) -> str:
        return f"<Holding id={self.id} ticker={self.ticker} qty={self.quantity}>"

class MarketData(Base):
    """OHLCV daily bar for a ticker."""

    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)

    __table_args__ = (UniqueConstraint("ticker", "date", name="_marketdata_ticker_date_uc"),)

    def __repr__(self) -> str:
        return f"<MarketData ticker={self.ticker} date={self.date}>"

class Sentiment(Base):
    """Aggregated buzz score per ticker per day."""

    __tablename__ = "sentiments"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    score = Column(Float, nullable=False)

    __table_args__ = (UniqueConstraint("ticker", "date", name="_sentiment_ticker_date_uc"),)

    def __repr__(self) -> str:
        return f"<Sentiment ticker={self.ticker} date={self.date} score={self.score}>"

class Indicator(Base):
    """Technical indicator values per ticker per day."""

    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    rsi = Column(Float, nullable=True)
    macd = Column(Float, nullable=True)
    sma_20 = Column(Float, nullable=True)
    sma_50 = Column(Float, nullable=True)

    __table_args__ = (UniqueConstraint("ticker", "date", name="_indicator_ticker_date_uc"),)

    def __repr__(self) -> str:
        return f"<Indicator ticker={self.ticker} date={self.date}>"

class AdvisorySignal(Base):
    """Buy/Hold/Sell recommendation per ticker per day."""

    __tablename__ = "advisory_signals"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    signal = Column(String, nullable=False)  # Expected values: 'Buy', 'Hold', 'Sell'
    explanation = Column(String, nullable=True)

    __table_args__ = (UniqueConstraint("ticker", "date", name="_signal_ticker_date_uc"),)

    def __repr__(self) -> str:
        return f"<AdvisorySignal ticker={self.ticker} date={self.date} signal={self.signal}>"
