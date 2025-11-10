import os
import asyncio
import logging
from datetime import date
from typing import List

import httpx
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db import get_session
from backend.models import MarketData

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

API_URL = "https://api.example.com/marketdata"  # Placeholder URL
API_KEY = os.getenv("MARKET_API_KEY")
if not API_KEY:
    raise RuntimeError("MARKET_API_KEY environment variable not set")


def fetch_historical(ticker: str, start: date, end: date) -> pd.DataFrame:
    """Fetch historical OHLCV data for a ticker.

    Returns a pandas DataFrame with columns: ['date', 'open', 'high', 'low', 'close', 'volume'].
    """
    params = {
        "symbol": ticker,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "apikey": API_KEY,
    }
    try:
        response = httpx.get(API_URL, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        df = pd.DataFrame(data["prices"]).rename(columns={"date": "date", "open": "open", "high": "high", "low": "low", "close": "close", "volume": "volume"})
        df["date"] = pd.to_datetime(df["date"]).dt.date
        return df
    except httpx.HTTPError as exc:
        logger.error("Error fetching market data for %s: %s", ticker, exc)
        raise HTTPException(status_code=502, detail="Failed to fetch market data")


def store_market_data(df: pd.DataFrame, ticker: str, db: Session) -> None:
    """Upsert daily market bars into the ``MarketData`` table.
    """
    try:
        for _, row in df.iterrows():
            existing = (
                db.query(MarketData)
                .filter(MarketData.ticker == ticker, MarketData.date == row["date"])
                .first()
            )
            if existing:
                existing.open = row["open"]
                existing.high = row["high"]
                existing.low = row["low"]
                existing.close = row["close"]
                existing.volume = row["volume"]
            else:
                new_record = MarketData(
                    ticker=ticker,
                    date=row["date"],
                    open=row["open"],
                    high=row["high"],
                    low=row["low"],
                    close=row["close"],
                    volume=row["volume"],
                )
                db.add(new_record)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.exception("Database error while storing market data for %s", ticker)
        raise HTTPException(status_code=500, detail="Failed to store market data")


async def ingest_ticker(ticker: str, start: date, end: date, db: Session) -> None:
    """Orchestrate fetching and storing market data with retry logic.
    """
    max_retries = 3
    backoff = 2
    for attempt in range(1, max_retries + 1):
        try:
            df = fetch_historical(ticker, start, end)
            store_market_data(df, ticker, db)
            logger.info("Successfully ingested market data for %s", ticker)
            break
        except HTTPException as http_err:
            if attempt == max_retries:
                logger.error("Max retries reached for %s. Giving up.", ticker)
                raise
            wait = backoff ** attempt
            logger.warning("Retry %d for %s after %s seconds", attempt, ticker, wait)
            await asyncio.sleep(wait)
        except Exception as exc:
            logger.exception("Unexpected error during ingestion of %s", ticker)
            raise HTTPException(status_code=500, detail="Unexpected ingestion error")