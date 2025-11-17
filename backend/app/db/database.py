from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from fastapi import Depends
from contextvars import ContextVar
from typing import AsyncGenerator

# Async engine creation
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, future=True)

# Session factory bound to the engine
async_session_factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Context variable to store the current session (useful for nested dependencies)
_current_session: ContextVar[AsyncSession | None] = ContextVar("current_session", default=None)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides an async DB session and ensures cleanup.

    Yields:
        An instance of AsyncSession.
    """
    async with async_session_factory() as session:
        token = _current_session.set(session)
        try:
            yield session
        finally:
            _current_session.reset(token)
            await session.close()
