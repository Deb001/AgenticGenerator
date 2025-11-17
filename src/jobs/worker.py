from celery import Celery
from src.config import settings

celery_app = Celery(
    "portfolio_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Auto‑discover tasks in the ``src.jobs`` package
celery_app.autodiscover_tasks(["src.jobs"])
