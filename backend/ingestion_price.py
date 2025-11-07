import pandas as pd
import requests
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from .database import get_db
from .models import HistoricalPrice
from .utils import log_info, retry

API_ENDPOINT = "https://api.example.com/price"

@retry(attempts=3, backoff_factor=2)
def fetch_price_data(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
    """Fetch OHLCV price data for a symbol between ``start_date`` and ``end_date``.

    Args:
        symbol: Ticker symbol.
        start_date: ISO format start date (YYYY‑MM‑DD).
        end_date: ISO format end date (YYYY‑MM‑DD).

    Returns:
        DataFrame with columns ``date, open, high, low, close, volume``.

    Raises:
        ValueError: If the response does not contain the expected data.
    """
    params = {"symbol": symbol, "start": start_date, "end": end_date}
    response = requests.get(API_ENDPOINT, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, list):
        raise ValueError(f"Unexpected data format for symbol {symbol}")
    df = pd.DataFrame(data)
    required_cols = {"date", "open", "high", "low", "close", "volume"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Missing required columns in price data for {symbol}")
    df["date"] = pd.to_datetime(df["date"])
    return df

def _upsert_prices(session: Session, symbol: str, df: pd.DataFrame) -> None:
    for _, row in df.iterrows():
        price = HistoricalPrice(
            symbol=symbol,
            date=row["date"],
            open=row["open"],
            high=row["high"],
            low=row["low"],
            close=row["close"],
            volume=row["volume"],
        )
        session.merge(price)

def backfill_prices(symbols: List[str]) -> None:
    """Backfill missing historical price data for a list of symbols.

    Args:
        symbols: List of ticker symbols to backfill.
    """
    today = datetime.utcnow().date()
    start_date = "2000-01-01"
    end_date = today.isoformat()
    db_generator = get_db()
    session = next(db_generator)
    try:
        for symbol in symbols:
            try:
                log_info(f"Fetching price data for {symbol}")
                df = fetch_price_data(symbol, start_date, end_date)
                _upsert_prices(session, symbol, df)
                session.commit()
                log_info(f"Backfilled {len(df)} rows for {symbol}")
            except Exception as e:
                session.rollback()
                log_info(f"Failed to backfill {symbol}: {e}")
    finally:
        session.close()
        db_generator.close()

def schedule_ingestion() -> None:
    """Schedule daily price ingestion using APScheduler."""
    from apscheduler.schedulers.background import BackgroundScheduler

    scheduler = BackgroundScheduler()
    symbols = ["AAPL", "MSFT", "GOOGL"]  # In production this list would be dynamic
    scheduler.add_job(lambda: backfill_prices(symbols), "cron", hour=0, minute=5, id="price_backfill")
    scheduler.start()
    log_info("Price ingestion scheduler started")