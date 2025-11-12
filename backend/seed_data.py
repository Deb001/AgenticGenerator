import random
from datetime import datetime, timedelta
from faker import Faker
from backend.app.database import engine, Base, get_session
from backend.app.models import User, Portfolio, Holding, PriceHistory, Sector
from backend.app.auth import get_password_hash

fake = Faker()


def run_seed() -> None:
    """Populate the development database with mock data.
    """
    Base.metadata.create_all(bind=engine)
    db = get_session()
    try:
        # Create a known advisor user
        advisor_email = "advisor@example.com"
        advisor_password = "password123"
        advisor = User(
            email=advisor_email,
            hashed_password=get_password_hash(advisor_password),
            is_advisor=True,
        )
        db.add(advisor)
        db.flush()  # Obtain advisor.id without committing yet

        # Static list of Indian NSE tickers (sample)
        tickers = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC", "HINDUNILVR", "SBIN", "AXISBANK", "KOTAKBANK", "MARUTI"]
        sectors = {
            "RELIANCE": "Energy",
            "TCS": "Technology",
            "INFY": "Technology",
            "HDFCBANK": "Financial",
            "ITC": "Consumer",
            "HINDUNILVR": "Consumer",
            "SBIN": "Financial",
            "AXISBANK": "Financial",
            "KOTAKBANK": "Financial",
            "MARUTI": "Automobile",
        }

        # Create sectors
        for ticker, sector_name in sectors.items():
            db.add(Sector(ticker=ticker, sector_name=sector_name))

        # Create 3 portfolios each with 5 random holdings
        for i in range(3):
            portfolio = Portfolio(name=f"Portfolio {i+1}", advisor_id=advisor.id)
            db.add(portfolio)
            db.flush()
            selected_tickers = random.sample(tickers, 5)
            for ticker in selected_tickers:
                holding = Holding(portfolio_id=portfolio.id, ticker=ticker, quantity=random.randint(10, 100))
                db.add(holding)
                # Generate 90 days of synthetic price data (random walk)
                price = random.randint(500, 2000)
                for day in range(90):
                    date = datetime.utcnow() - timedelta(days=day)
                    # Random walk step
                    price += random.randint(-20, 20)
                    price = max(1, price)  # Ensure price stays positive
                    ph = PriceHistory(ticker=ticker, date=date, close=price)
                    db.add(ph)
        db.commit()
        print("✅ Seed data inserted successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()