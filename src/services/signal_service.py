from src.db import Session
from src.models.historical_price import HistoricalPrice
from src.models.portfolio import Portfolio
from src.models.holding import Holding
from src.schemas.signal import SignalRead
from sqlalchemy import func, desc
from datetime import date, timedelta
from fastapi import HTTPException, status

def compute_signal_for_ticker(db: Session, ticker: str) -> SignalRead:
    """Calculate the latest advisory signal for a ticker using SMA20 vs SMA50.

    Raises ``HTTPException`` with 400 if insufficient data (<50 days).
    """
    # Retrieve the most recent 50 closing prices ordered by trade_date descending
    prices = (
        db.query(HistoricalPrice.close, HistoricalPrice.trade_date)
        .filter(HistoricalPrice.ticker == ticker)
        .order_by(desc(HistoricalPrice.trade_date))
        .limit(50)
        .all()
    )
    if len(prices) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough data for ticker {ticker}",
        )
    closes = [p[0] for p in prices]
    sma20 = sum(closes[:20]) / 20
    sma50 = sum(closes) / 50
    if sma20 > sma50:
        recommendation = "Buy"
    elif sma20 < sma50:
        recommendation = "Sell"
    else:
        recommendation = "Hold"
    latest_trade_date = prices[0][1]
    latest_close = closes[0]
    return SignalRead(
        ticker=ticker,
        trade_date=latest_trade_date,
        close_price=latest_close,
        recommendation=recommendation,
    )

def recompute_all_signals(db: Session) -> list[SignalRead]:
    """Iterate over distinct tickers in ``historical_prices`` and compute signals.

    Returns a list of ``SignalRead`` objects.
    """
    tickers = db.query(HistoricalPrice.ticker).distinct().all()
    results: list[SignalRead] = []
    for (ticker,) in tickers:
        try:
            signal = compute_signal_for_ticker(db, ticker)
            results.append(signal)
        except HTTPException as exc:
            # Skip tickers with insufficient data but continue processing others
            continue
    return results
