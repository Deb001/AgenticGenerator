import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.engine import Engine

def get_engine() -> Engine:
    """
    Create a SQLAlchemy engine using the ``DATABASE_URL`` environment variable.

    Returns:
        Engine: A SQLAlchemy engine instance.

    Raises:
        RuntimeError: If ``DATABASE_URL`` is not set in the environment.
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("Environment variable DATABASE_URL is required but not set.")
    # ``future=True`` enables 2.0 style usage and ``pool_pre_ping`` helps recover from stale connections.
    return create_engine(database_url, future=True, pool_pre_ping=True)

# Initialise engine and session factory at import time so they are ready for the rest of the application.
engine = get_engine()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)

def get_session() -> Session:
    """Provide a new SQLAlchemy ``Session`` bound to the engine.

    Returns:
        Session: A new session instance.
    """
    return SessionLocal()

# Base class for all ORM models.
Base = declarative_base()
