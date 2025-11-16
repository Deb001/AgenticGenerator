import random
from datetime import datetime, timedelta
from typing import List
import pandas as pd
from sqlalchemy.orm import Session
from app import models

def _random_price_series(start: datetime, end: datetime, start_price: float) -> List[dict]:
    dates = pd.date_range(start=start, end=end, freq="B")  # business days
    price = start_price
    data = []
    for date in dates:
        # Simulate random walk
        change_pct = random.uniform(-0.02, 0.02)
        open_price = price
        high_price = open_price * (1 + random.uniform(0, 0.015))
        low_price = open_price * (1 - random.uniform(0, 0.015))
        close_price = open_price * (1 + change_pct)
        volume = random.randint(1000, 10000)
        data.append(
            {
                "ticker": "",
                "date": date,
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": volume,
                "source": "seed",
            }
        )
        price = close_price
    return data

def seed_data(db: Session) -> None:
    """Populate the database with mock sectors, clients, portfolios, holdings and price data."""
    # Clear existing data (optional, for idempotency)
    db.query(models.AdvisorySignal).delete()
    db.query(models.HistoricalPrice).delete()
    db.query(models.Holding).delete()
    db.query(models.Portfolio).delete()
    db.query(models.Client).delete()
    db.query(models.Sector).delete()
    db.query(models.User).delete()
    db.commit()

    # Create sectors
    sectors = [
        models.Sector(name="Technology", potential_score=0.85),
        models.Sector(name="Healthcare", potential_score=0.65),
        models.Sector(name="Finance", potential_score=0.45),
    ]
    db.add_all(sectors)
    db.commit()
    for s in sectors:
        db.refresh(s)

    # Create a demo advisor user
    from app.auth import get_password_hash
    advisor = models.User(email="advisor@example.com", hashed_password=get_password_hash("password123"))
    db.add(advisor)
    db.commit()
    db.refresh(advisor)

    # Create clients and portfolios
    client1 = models.Client(name="Acme Corp", sector_id=sectors[0].id)
    client2 = models.Client(name="HealthPlus Ltd", sector_id=sectors[1].id)
    db.add_all([client1, client2])
    db.commit()
    db.refresh(client1)
    db.refresh(client2)

    portfolio1 = models.Portfolio(client_id=client1.id, name="Acme Growth")
    portfolio2 = models.Portfolio(client_id=client2.id, name="HealthPlus Income")
    db.add_all([portfolio1, portfolio2])
    db.commit()
    db.refresh(portfolio1)
    db.refresh(portfolio2)

    # Add holdings
    holdings = [
        models.Holding(portfolio_id=portfolio1.id, ticker="AAPL", quantity=150, avg_price=120.0),
        models.Holding(portfolio_id=portfolio1.id, ticker="MSFT", quantity=80, avg_price=210.0),
        models.Holding(portfolio_id=portfolio2.id, ticker="PFE", quantity=200, avg_price=35.0),
        models.Holding(portfolio_id=portfolio2.id, ticker="JNJ", quantity=60, avg_price=160.0),
    ]
    db.add_all(holdings)
    db.commit()

    # Generate historical price data for each ticker
    tickers = {h.ticker for h in holdings}
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=365)
    for ticker in tickers:
        series = _random_price_series(start=start_date, end=end_date, start_price=random.uniform(20, 200))
        for row in series:
            row["ticker"] = ticker
            price = models.HistoricalPrice(**row)
            db.add(price)
    db.commit()

if __name__ == "__main__":
    from app.database import SessionLocal
    db = SessionLocal()
    seed_data(db)
    db.close()
