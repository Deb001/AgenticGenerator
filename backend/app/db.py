from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from .config import settings

# Using NullPool for simplicity in development; replace with a proper pool in production.
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    future=True,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()
