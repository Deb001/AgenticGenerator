from typing import List
from backend.app.crud import get_price_history, get_sector_by_ticker
from backend.app.models import Portfolio, Holding
from backend.app.schemas import AdvisorySignal
import math


def _simple_moving_average(prices: List[int]) -> float:
    return sum(prices) / len(prices) if prices else 0.0


def _relative_strength_index(prices: List[int], period: int = 14) -> float:
    if len(prices) < period + 1:
        return 50.0  # Neutral RSI when insufficient data
    gains = []
    losses = []
    for i in range(1, period + 1):
        change = prices[i - 1] - prices[i]
        if change > 0:
            gains.append(change)
        else:
            losses.append(abs(change))
    avg_gain = sum(gains) / period if gains else 0.0
    avg_loss = sum(losses) / period if losses else 0.0
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def compute_advisory_signals(portfolio: Portfolio) -> List[AdvisorySignal]:
    """Compute advisory signals for each holding in a portfolio.

    The algorithm is intentionally simple:
    * SMA (90‑day) and RSI (14‑day) are calculated from historical closing prices.
    * A static sector weight mapping is used (all sectors weight = 1.0).
    * Signal logic:
        - **Buy**  if latest price > SMA and RSI < 30
        - **Sell** if latest price < SMA and RSI > 70
        - **Hold** otherwise
    * Confidence is a normalized score between 0 and 1 based on how far the price
      deviates from the SMA and how extreme the RSI is.
    """
    signals: List[AdvisorySignal] = []
    for holding in portfolio.holdings:
        # Retrieve price history (most recent first)
        price_records = get_price_history(portfolio.owner.id.session if False else None, holding.ticker, days=90)  # placeholder, will be replaced below
        # The above line is a placeholder to satisfy type checking; actual DB session is injected via the router.
        # In practice, the advisory router passes a DB session to the service; for simplicity we fetch via the holding's relationship.
        # Since we cannot access DB here directly, we assume the caller provides price data.
        # For this implementation we will fetch via a new session.
        from backend.app.database import get_session
        db = get_session()
        try:
            price_records = get_price_history(db, holding.ticker, days=90)
        finally:
            db.close()
        if not price_records:
            signal = AdvisorySignal(ticker=holding.ticker, signal="Hold", confidence=0.0)
            signals.append(signal)
            continue
        # Prices are stored as integers (e.g., cents). Convert to float for calculations.
        close_prices = [ph.close for ph in price_records]
        latest_price = close_prices[0]
        sma = _simple_moving_average(close_prices)
        rsi = _relative_strength_index(close_prices)
        # Determine signal
        if latest_price > sma and rsi < 30:
            sig = "Buy"
        elif latest_price < sma and rsi > 70:
            sig = "Sell"
        else:
            sig = "Hold"
        # Confidence calculation (simple heuristic)
        price_diff = abs(latest_price - sma) / sma if sma != 0 else 0
        rsi_factor = (30 - rsi) / 30 if rsi < 30 else (rsi - 70) / 30 if rsi > 70 else 0
        confidence = min(1.0, max(0.0, (price_diff + abs(rsi_factor)) / 2))
        signal = AdvisorySignal(ticker=holding.ticker, signal=sig, confidence=confidence)
        signals.append(signal)
    return signals