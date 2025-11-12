from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.engine import Engine
from backend.app.config import settings

# Create the SQLAlchemy engine. ``pool_pre_ping`` ensures connections are
# validated before use, which helps with Docker container restarts.
engine: Engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)

# Session factory used throughout the application.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

# Base class for declarative models.
Base = declarative_base()


def get_engine() -> Engine:
    """Return the SQLAlchemy engine instance.

    This function exists mainly for testability and to keep the public API
    consistent with the specification.
    """
    return engine


def get_session() -> SessionLocal:
    """Return a new SQLAlchemy session.

    The caller is responsible for closing the session.
    """
    return SessionLocal()


def get_db():
    """FastAPI dependency that provides a database session and ensures it is closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()