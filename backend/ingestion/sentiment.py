import os
import asyncio
import logging
from datetime import date
from typing import List

import httpx
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db import get_session
from backend.models import Sentiment

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

SENTIMENT_API_URL = "https://api.example.com/sentiment"  # Placeholder URL
SENTIMENT_API_KEY = os.getenv("SENTIMENT_API_KEY")
if not SENTIMENT_API_KEY:
    raise RuntimeError("SENTIMENT_API_KEY environment variable not set")


def fetch_sentiment(ticker: str, target_date: date) -> float:
    """Fetch sentiment score for a ticker on a specific date.

    Returns a float representing the buzz score.
    """
    params = {
        "symbol": ticker,
        "date": target_date.isoformat(),
        "apikey": SENTIMENT_API_KEY,
    }
    try:
        response = httpx.get(SENTIMENT_API_URL, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        return float(data.get("score", 0.0))
    except httpx.HTTPError as exc:
        logger.error("Error fetching sentiment for %s on %s: %s", ticker, target_date, exc)
        raise HTTPException(status_code=502, detail="Failed to fetch sentiment data")


def store_sentiment(ticker: str, target_date: date, score: float, db: Session) -> None:
    """Insert or update a ``Sentiment`` record.
    """
    try:
        existing = (
            db.query(Sentiment)
            .filter(Sentiment.ticker == ticker, Sentiment.date == target_date)
            .first()
        )
        if existing:
            existing.score = score
        else:
            new_sent = Sentiment(ticker=ticker, date=target_date, score=score)
            db.add(new_sent)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.exception("Database error while storing sentiment for %s on %s", ticker, target_date)
        raise HTTPException(status_code=500, detail="Failed to store sentiment data")


async def ingest_sentiment_for_date(target_date: date, tickers: List[str], db: Session) -> None:
    """Ingest sentiment scores for a list of tickers on a given date.
    """
    semaphore = asyncio.Semaphore(5)  # limit concurrent requests

    async def _process(ticker: str):
        async with semaphore:
            max_retries = 3
            backoff = 2
            for attempt in range(1, max_retries + 1):
                try:
                    # httpx is sync; run in thread pool
                    loop = asyncio.get_event_loop()
                    score = await loop.run_in_executor(None, fetch_sentiment, ticker, target_date)
                    await loop.run_in_executor(None, store_sentiment, ticker, target_date, score, db)
                    logger.info("Stored sentiment for %s on %s", ticker, target_date)
                    break
                except HTTPException as http_err:
                    if attempt == max_retries:
                        logger.error("Max retries reached for sentiment %s on %s", ticker, target_date)
                        break
                    wait = backoff ** attempt
                    logger.warning("Retry %d for sentiment %s after %s seconds", attempt, ticker, wait)
                    await asyncio.sleep(wait)
                except Exception as exc:
                    logger.exception("Unexpected error ingesting sentiment for %s", ticker)
                    break

    await asyncio.gather(*[_process(t) for t in tickers])