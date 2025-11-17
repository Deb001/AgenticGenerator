from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, UniqueConstraint
from app.db.base_class import Base


class ComputedMetric(Base):
    """Pre‑computed metric for a portfolio on a given date.

    Unique constraint ensures one metric per (portfolio, name, date).
    """

    __tablename__ = "computed_metrics"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    metric_name = Column(String, nullable=False)
    metric_date = Column(Date, nullable=False)
    value = Column(Float, nullable=False)

    __table_args__ = (UniqueConstraint("portfolio_id", "metric_name", "metric_date", name="uq_metric"),)

    def __repr__(self) -> str:
        return f"<ComputedMetric portfolio={self.portfolio_id} name={self.metric_name} date={self.metric_date}>"
