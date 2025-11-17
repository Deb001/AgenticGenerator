from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Portfolio(Base):
    """Container for a client's portfolio.

    Attributes:
        id: Primary key.
        client_name: Name of the client.
        advisor_id: Foreign key to User.id.
        created_at: Timestamp.
        holdings: Relationship to Holding.
        advisor: Back reference to User.
    """

    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    advisor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    advisor = relationship("User", back_populates="portfolio", foreign_keys=[advisor_id])
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Portfolio id={self.id} client={self.client_name}>"


class Holding(Base):
    """Individual equity holding within a portfolio.

    Attributes:
        id: Primary key.
        portfolio_id: FK to Portfolio.
        ticker: Stock ticker.
        quantity: Number of shares.
        avg_price: Average purchase price.
        last_price: Most recent market price.
    """

    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    avg_price = Column(Float, nullable=False)
    last_price = Column(Float, nullable=True)

    portfolio = relationship("Portfolio", back_populates="holdings")
    transactions = relationship("Transaction", back_populates="holding", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Holding id={self.id} ticker={self.ticker} qty={self.quantity}>"


class Transaction(Base):
    """Buy or sell transaction linked to a holding.

    Attributes:
        id: Primary key.
        holding_id: FK to Holding.
        transaction_type: "BUY" or "SELL".
        quantity: Number of shares transacted.
        price: Price per share.
        timestamp: When the transaction occurred.
    """

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    holding_id = Column(Integer, ForeignKey("holdings.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # Could be Enum in future
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    holding = relationship("Holding", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction id={self.id} type={self.transaction_type} qty={self.quantity}>"
