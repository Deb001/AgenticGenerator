import datetime
from typing import Dict
from app.indicator import compute_indicators
from app.crud import get_sector_potential
from app.models import AdvisorySignal
from sqlalchemy.orm import Session

def generate_signal(ticker: str, date: datetime.datetime, db: Session) -> AdvisorySignal:
    """Generate an advisory signal for a ticker on a specific date.

    The function computes technical indicators, fetches sector potential, applies a
    simple rule‑engine and returns an unsaved ``AdvisorySignal`` instance.
    """
    # Compute indicators using a 180‑day look‑back window
    start = date - datetime.timedelta(days=180)
    indicators = compute_indicators(ticker, start, date, db)
    sma = indicators["sma_20"].iloc[-1]
    ema = indicators["ema_20"].iloc[-1]
    rsi = indicators["rsi_14"].iloc[-1]
    sector_score = get_sector_potential(db, ticker)

    if sma > ema and rsi < 30:
        base_signal = "Buy"
        rationale = f"SMA({sma:.2f}) > EMA({ema:.2f}) and RSI({rsi:.1f}) < 30"
    elif sma < ema and rsi > 70:
        base_signal = "Sell"
        rationale = f"SMA({sma:.2f}) < EMA({ema:.2f}) and RSI({rsi:.1f}) > 70"
    else:
        base_signal = "Hold"
        rationale = f"No strong trend; SMA={sma:.2f}, EMA={ema:.2f}, RSI={rsi:.1f}"

    if sector_score > 0.7 and base_signal == "Buy":
        rationale += f"; sector potential {sector_score:.2f} reinforces Buy"
    elif sector_score < 0.3 and base_signal == "Sell":
        rationale += f"; sector potential {sector_score:.2f} reinforces Sell"

    signal = AdvisorySignal(
        ticker=ticker,
        date=date,
        signal=base_signal,
        rationale=rationale,
    )
    return signal