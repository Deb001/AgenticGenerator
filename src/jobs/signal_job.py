from celery import shared_task
from src.db import SessionLocal
from src.services.signal_service import recompute_all_signals
from src.utils.logger import logger

@shared_task(name="recompute_signals_task")
def recompute_signals_task() -> list[dict]:
    """Celery task that recomputes all advisory signals.

    Returns a list of dictionaries suitable for JSON serialization.
    """
    db = SessionLocal()
    try:
        signals = recompute_all_signals(db)
        logger.info("Recomputed signals", extra={"count": len(signals)})
        # Convert Pydantic models to dicts
        return [s.dict() for s in signals]
    except Exception as exc:
        logger.exception("Error during signal recomputation")
        raise exc
    finally:
        db.close()
