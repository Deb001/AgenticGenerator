import logging
from datetime import date, datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler

from backend.db import get_session
from backend.ingestion.market_data import ingest_ticker
from backend.ingestion.sentiment import ingest_sentiment_for_date
from backend.engine.advisory import run_daily_job

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def _market_data_job():
    """Job that ingests market data for all tickers for the previous day.
    """
    today = date.today()
    target_date = today - timedelta(days=1)
    # Example tickers list – in production this would be dynamic
    tickers = ["AAPL", "MSFT", "GOOG"]
    with get_session() as db:
        for ticker in tickers:
            try:
                # Assuming we want a 30‑day window ending at target_date
                start = target_date - timedelta(days=30)
                asyncio.run(ingest_ticker(ticker, start, target_date, db))
            except Exception as exc:
                logger.exception("Market data ingestion failed for %s", ticker)


def _sentiment_job():
    """Job that ingests sentiment scores for all tickers for the previous day.
    """
    today = date.today()
    target_date = today - timedelta(days=1)
    tickers = ["AAPL", "MSFT", "GOOG"]
    with get_session() as db:
        try:
            asyncio.run(ingest_sentiment_for_date(target_date, tickers, db))
        except Exception as exc:
            logger.exception("Sentiment ingestion failed for %s", target_date)


def _advisory_job():
    """Job that runs the advisory engine for the previous day.
    """
    today = date.today()
    target_date = today - timedelta(days=1)
    with get_session() as db:
        try:
            run_daily_job(target_date, db)
        except Exception as exc:
            logger.exception("Advisory engine failed for %s", target_date)


def schedule_jobs() -> None:
    """Initialise APScheduler and schedule daily ingestion and advisory jobs.
    """
    scheduler = BackgroundScheduler()
    scheduler.add_job(_market_data_job, "cron", hour=2, minute=0, id="market_data_job")
    scheduler.add_job(_sentiment_job, "cron", hour=3, minute=0, id="sentiment_job")
    scheduler.add_job(_advisory_job, "cron", hour=4, minute=0, id="advisory_job")
    scheduler.start()
    logger.info("Scheduled background jobs: market data, sentiment, advisory")