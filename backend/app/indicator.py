import pandas as pd
from functools import lru_cache
from typing import Tuple, Dict, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.crud import get_historical_prices

def sma(series: pd.Series, window: int) -> pd.Series:
    """Simple Moving Average."""
    return series.rolling(window=window, min_periods=1).mean()

def ema(series: pd.Series, window: int) -> pd.Series:
    """Exponential Moving Average."""
    return series.ewm(span=window, adjust=False).mean()

def rsi(series: pd.Series, window: int = 14) -> pd.Series:
    """Relative Strength Index.
    Uses the Wilder smoothing method.
    """
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -delta.clip(upper=0)
    ma_up = up.ewm(com=window - 1, adjust=False).mean()
    ma_down = down.ewm(com=window - 1, adjust=False).mean()
    rs = ma_up / ma_down
    return 100 - (100 / (1 + rs))

def macd(
    series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """Moving Average Convergence Divergence.
    Returns macd_line, signal_line, histogram.
    """
    fast_ema = ema(series, fast)
    slow_ema = ema(series, slow)
    macd_line = fast_ema - slow_ema
    signal_line = ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

@lru_cache(maxsize=128)
def _load_price_series(
    ticker: str, start: datetime, end: datetime, db: Session
) -> pd.Series:
    rows = get_historical_prices(db, ticker, start, end)
    if not rows:
        raise ValueError(f"No price data for {ticker} in the requested range")
    df = pd.DataFrame(rows, columns=["date", "close"])
    df.set_index("date", inplace=True)
    return df["close"].sort_index()

def compute_indicators(
    ticker: str, start: datetime, end: datetime, db: Session
) -> Dict[str, pd.Series]:
    """Compute SMA, EMA, RSI and MACD for a ticker between start and end dates.

    Returns a dictionary where each key maps to a pandas Series indexed by date.
    """
    series = _load_price_series(ticker, start, end, db)
    return {
        "sma_20": sma(series, 20),
        "ema_20": ema(series, 20),
        "rsi_14": rsi(series, 14),
        "macd": macd(series),
    }