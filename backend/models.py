from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Client(Base):
    """Represents an end‑customer."""
    __tablename__ = "client"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)


class Advisor(Base):
    """Advisor user with role‑based access."""
    __tablename__ = "advisor"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="advisor")


class Portfolio(Base):
    """Collection of holdings belonging to a client."""
    __tablename__ = "portfolio"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client.id"))
    advisor_id = Column(Integer, ForeignKey("advisor.id"))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())

    client = relationship("Client", backref="portfolios")
    advisor = relationship("Advisor", backref="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    """A security position within a portfolio."""
    __tablename__ = "holding"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolio.id"))
    symbol = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    average_price = Column(Float, nullable=False)

    portfolio = relationship("Portfolio", back_populates="holdings")


class HistoricalPrice(Base):
    """OHLCV daily price data for a security."""
    __tablename__ = "historical_price"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Float)


class SectorInfo(Base):
    """Metadata about a sector and its aggregate score."""
    __tablename__ = "sector_info"
    id = Column(Integer, primary_key=True, index=True)
    sector_name = Column(String, unique=True, nullable=False)
    score = Column(Float)
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())


class SentimentRecord(Base):
    """News buzz sentiment for a symbol on a given date."""
    __tablename__ = "sentiment_record"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    sentiment_score = Column(Float)
    source = Column(String)


class Signal(Base):
    """Advisory signal generated for a symbol on a date."""
    __tablename__ = "signal"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    date = Column(DateTime, index=True, nullable=False, default=func.now())
    recommendation = Column(String)
    provenance = Column(String)
    generated_by = Column(String)