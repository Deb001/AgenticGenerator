import logging
from datetime import datetime
from typing import Any, Dict

logger = logging.getLogger("audit")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


def record(event: str, user_id: int | None = None, details: Dict[str, Any] | None = None) -> None:
    """Record an audit event.

    For this example we simply log to stdout. In production you would write to a
    dedicated audit table or external logging service.
    """
    payload = {
        "event": event,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
        "details": details or {},
    }
    logger.info(payload)
