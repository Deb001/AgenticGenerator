import requests
from typing import List, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from .database import get_db
from .models import SentimentRecord
from .utils import log_info, retry
from nltk.sentiment.vader import SentimentIntensityAnalyzer

NEWS_API_ENDPOINT = "https://api.example.com/news"

@retry(attempts=3, backoff_factor=2)
def fetch_news(symbol: str) -> List[Dict]:
    """Fetch recent news articles for a given symbol.

    Returns a list of dictionaries containing at least ``url``, ``title`` and ``content``.
    """
    params = {"symbol": symbol, "limit": 20}
    response = requests.get(NEWS_API_ENDPOINT, params=params, timeout=10)
    response.raise_for_status()
    articles = response.json()
    if not isinstance(articles, list):
        raise ValueError(f"Unexpected news format for {symbol}")
    return articles

def extract_sentiment(texts: List[str]) -> float:
    """Compute the average compound VADER sentiment score for a list of texts."""
    analyzer = SentimentIntensityAnalyzer()
    if not texts:
        return 0.0
    scores = [analyzer.polarity_scores(t)["compound"] for t in texts]
    return sum(scores) / len(scores)

def ingest_buzz(symbols: List[str]) -> None:
    """Ingest news buzz sentiment for each symbol and store it in the database."""
    today = datetime.utcnow()
    db_generator = get_db()
    session = next(db_generator)
    try:
        for symbol in symbols:
            try:
                log_info(f"Fetching news for {symbol}")
                articles = fetch_news(symbol)
                # Deduplicate by URL
                unique_articles = {}
                for art in articles:
                    url = art.get("url")
                    if url and url not in unique_articles:
                        unique_articles[url] = art
                texts = [a.get("title", "") + " " + a.get("content", "") for a in unique_articles.values()]
                sentiment = extract_sentiment(texts)
                record = SentimentRecord(
                    symbol=symbol,
                    date=today,
                    sentiment_score=sentiment,
                    source="news_api",
                )
                session.merge(record)
                session.commit()
                log_info(f"Stored sentiment for {symbol}: {sentiment:.3f}")
            except Exception as e:
                session.rollback()
                log_info(f"Error processing {symbol}: {e}")
    finally:
        session.close()
        db_generator.close()