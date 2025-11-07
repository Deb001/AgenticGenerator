import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, Session
from sqlalchemy.engine import Engine
from .models import Base


def get_engine() -> Engine:
    """Create a SQLAlchemy engine using the ``DATABASE_URL`` environment variable.

    Raises:
        RuntimeError: If ``DATABASE_URL`` is not set.
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    engine = create_engine(database_url, pool_pre_ping=True, future=True)
    # Bind metadata and create tables if they do not exist
    Base.metadata.bind = engine
    Base.metadata.create_all(engine)
    return engine

# Scoped session factory used throughout the project
SessionLocal = scoped_session(sessionmaker(bind=get_engine(), autoflush=False, autocommit=False))


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session and ensures cleanup.

    Yields:
        Session: An active SQLAlchemy session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()