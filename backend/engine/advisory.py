from datetime import date
from typing import List
import logging

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db import get_session
from backend.models import Indicator, Sentiment, AdvisorySignal

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def compute_signal(ticker: str, target_date: date, db: Session) -> AdvisorySignal:
    """Aggregate latest indicators and sentiment, apply rule‑based logic, and create an ``AdvisorySignal``.
    """
    try:
        # Load latest indicator rows for the ticker/date
        indicators = (
            db.query(Indicator)
            .filter(Indicator.ticker == ticker, Indicator.date == target_date)
            .all()
        )
        if not indicators:
            logger.warning("No indicators found for %s on %s", ticker, target_date)
            return None
        # Convert to DataFrame for easier handling
        ind_df = pd.DataFrame([{
            "name": ind.name,
            "value": ind.value,
        } for ind in indicators])

        # Load sentiment
        sentiment = (
            db.query(Sentiment)
            .filter(Sentiment.ticker == ticker, Sentiment.date == target_date)
            .first()
        )
        if not sentiment:
            logger.warning("No sentiment data for %s on %s", ticker, target_date)
            return None

        # Example rule: use RSI and sentiment
        rsi_row = ind_df[ind_df["name"] == "RSI"]
        rsi = rsi_row["value"].iloc[0] if not rsi_row.empty else None
        sentiment_score = sentiment.score

        if rsi is None:
            logger.warning("RSI indicator missing for %s on %s", ticker, target_date)
            return None

        if rsi < 30 and sentiment_score > 0.7:
            recommendation = "Buy"
        elif rsi > 70 and sentiment_score < 0.3:
            recommendation = "Sell"
        else:
            recommendation = "Hold"

        explanation = f"RSI={rsi:.2f}, Sentiment={sentiment_score:.2f} => {recommendation}"

        signal = AdvisorySignal(
            ticker=ticker,
            date=target_date,
            recommendation=recommendation,
            explanation=explanation,
        )
        db.add(signal)
        db.commit()
        db.refresh(signal)
        logger.info("Generated advisory signal for %s on %s: %s", ticker, target_date, recommendation)
        return signal
    except SQLAlchemyError as e:
        db.rollback()
        logger.exception("Database error while computing signal for %s on %s", ticker, target_date)
        raise


def run_daily_job(target_date: date, db: Session) -> None:
    """Iterate all tickers with market data for the given date and compute signals.
    """
    try:
        tickers = [row[0] for row in db.query(Indicator.ticker).filter(Indicator.date == target_date).distinct()]
        for ticker in tickers:
            compute_signal(ticker, target_date, db)
    except Exception as exc:
        logger.exception("Failed to run daily advisory job for %s", target_date)
        raise