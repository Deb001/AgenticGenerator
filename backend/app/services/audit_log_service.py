from sqlmodel import Session
from ..models.portfolio import AuditLog
from datetime import datetime

def log_event(db: Session, user_id, event_type: str, description: str = None) -> None:
    """Create a simple audit log entry.

    Args:
        db: Database session.
        user_id: UUID of the user performing the action.
        event_type: Short string describing the event (e.g., "login").
        description: Optional longer description.
    """
    entry = AuditLog(user_id=user_id, event_type=event_type, description=description, timestamp=datetime.utcnow())
    db.add(entry)
    db.commit()
