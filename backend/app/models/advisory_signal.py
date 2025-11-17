from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum, UniqueConstraint
from enum import Enum as PyEnum
from app.db.base_class import Base


class SignalType(PyEnum):
    BUY = "BUY"
    HOLD = "HOLD"
    SELL = "SELL"


class AdvisorySignal(Base):
    """Rule‑based advisory signal for a portfolio.

    Unique per portfolio and date.
    """

    __tablename__ = "advisory_signals"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    signal_date = Column(Date, nullable=False)
    signal_type = Column(Enum(SignalType), nullable=False)
    confidence = Column(Float, nullable=False)  # 0.0 – 1.0
    rationale = Column(String, nullable=True)

    __table_args__ = (UniqueConstraint("portfolio_id", "signal_date", name="uq_signal"),)

    def __repr__(self) -> str:
        return f"<AdvisorySignal portfolio={self.portfolio_id} date={self.signal_date} type={self.signal_type}>"
