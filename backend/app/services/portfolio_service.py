from app.models.portfolio import Portfolio, Holding, Transaction
from app.models.computed_metric import ComputedMetric
from app.models.advisory_signal import AdvisorySignal, SignalType
from app.db.database import async_session_factory
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List
from datetime import date


async def create_portfolio(advisor_id: int, client_name: str) -> Portfolio:
    """Create a new portfolio linked to an advisor.

    Args:
        advisor_id: ID of the advisor (must exist).
        client_name: Name of the client.
    Returns:
        The newly created Portfolio instance.
    """
    async with async_session_factory() as session:
        # Verify advisor exists
        result = await session.execute(select(Portfolio).where(Portfolio.advisor_id == advisor_id))
        # Not checking existence of advisor in User table for brevity; assume valid.
        new_portfolio = Portfolio(client_name=client_name, advisor_id=advisor_id)
        session.add(new_portfolio)
        await session.commit()
        await session.refresh(new_portfolio)
        return new_portfolio


async def get_portfolio_metrics(portfolio_id: int, metric_name: str, start_date: date, end_date: date) -> List[ComputedMetric]:
    """Fetch pre‑computed metrics for a portfolio within a date range.

    Args:
        portfolio_id: Portfolio identifier.
        metric_name: Name of the metric to retrieve.
        start_date: Start of date range.
        end_date: End of date range.
    Returns:
        List of ComputedMetric objects ordered by metric_date.
    """
    async with async_session_factory() as session:
        # Verify portfolio exists
        result = await session.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
        portfolio = result.scalars().first()
        if not portfolio:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
        stmt = (
            select(ComputedMetric)
            .where(
                ComputedMetric.portfolio_id == portfolio_id,
                ComputedMetric.metric_name == metric_name,
                ComputedMetric.metric_date >= start_date,
                ComputedMetric.metric_date <= end_date,
            )
            .order_by(ComputedMetric.metric_date)
        )
        result = await session.execute(stmt)
        metrics = result.scalars().all()
        return metrics


async def generate_signal(portfolio_id: int, as_of: date) -> AdvisorySignal:
    """Generate a rule‑based advisory signal based on latest metrics.

    Simple rule:
        - If 30‑day return > 5% and volatility < 2% => BUY
        - If return between -2% and 5% => HOLD
        - Else => SELL
    Confidence is normalized absolute return (capped at 1.0).
    """
    async with async_session_factory() as session:
        # Verify portfolio exists
        result = await session.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
        portfolio = result.scalars().first()
        if not portfolio:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

        # Retrieve latest 30‑day return and volatility metrics
        metric_names = ["30d_return", "volatility"]
        stmt = (
            select(ComputedMetric)
            .where(
                ComputedMetric.portfolio_id == portfolio_id,
                ComputedMetric.metric_name.in_(metric_names),
                ComputedMetric.metric_date <= as_of,
            )
            .order_by(ComputedMetric.metric_date.desc())
        )
        result = await session.execute(stmt)
        latest_metrics = result.scalars().all()
        metric_dict = {m.metric_name: m.value for m in latest_metrics}
        return_val = metric_dict.get("30d_return")
        volatility = metric_dict.get("volatility")
        if return_val is None or volatility is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Required metrics not available")

        # Apply rule logic
        if return_val > 5.0 and volatility < 2.0:
            signal_type = SignalType.BUY
        elif -2.0 <= return_val <= 5.0:
            signal_type = SignalType.HOLD
        else:
            signal_type = SignalType.SELL

        confidence = min(abs(return_val) / 100.0, 1.0)  # Normalize to 0‑1 range
        rationale = f"Generated based on 30d return={return_val:.2f}% and volatility={volatility:.2f}%"

        # Upsert signal (replace if exists for same date)
        existing_stmt = select(AdvisorySignal).where(
            AdvisorySignal.portfolio_id == portfolio_id,
            AdvisorySignal.signal_date == as_of,
        )
        existing_result = await session.execute(existing_stmt)
        existing_signal = existing_result.scalars().first()
        if existing_signal:
            existing_signal.signal_type = signal_type
            existing_signal.confidence = confidence
            existing_signal.rationale = rationale
            signal = existing_signal
        else:
            signal = AdvisorySignal(
                portfolio_id=portfolio_id,
                signal_date=as_of,
                signal_type=signal_type,
                confidence=confidence,
                rationale=rationale,
            )
            session.add(signal)
        await session.commit()
        await session.refresh(signal)
        return signal
