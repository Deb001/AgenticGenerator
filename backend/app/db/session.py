from sqlmodel import create_engine, Session
from ..core.config import settings

engine = create_engine(settings.DB_URL, echo=False, future=True)

def get_session():
    """Yield a SQLModel session; used as a FastAPI dependency."""
    with Session(engine) as session:
        yield session
