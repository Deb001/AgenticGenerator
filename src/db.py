from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Generator
from time import sleep
from fastapi import HTTPException, status
from src.config import settings
from src.utils.logger import logger

# Create the SQLAlchemy engine with pool_pre_ping to validate connections
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.LOG_LEVEL.upper() == "DEBUG",
    pool_pre_ping=True,
)

# Base class for declarative models
Base = declarative_base()

# Session factory bound to the engine
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session.

    Implements up to three connection retries with exponential back‑off.
    """
    retries = 3
    delay = 1
    for attempt in range(1, retries + 1):
        try:
            db: Session = SessionLocal()
            yield db
            db.close()
            break
        except SQLAlchemyError as exc:
            logger.error(f"Database connection attempt {attempt} failed: {exc}")
            if attempt == retries:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Unable to connect to the database after multiple attempts.",
                )
            sleep(delay)
            delay *= 2
