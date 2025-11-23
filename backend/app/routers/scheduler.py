from fastapi import APIRouter, Depends, HTTPException, status
from datetime import date, timedelta
from ..schemas import ScheduleResponse
from ..scheduler import run_scheduler
from ..database import SessionLocal

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/run", response_model=dict)
def run(store_id: int, week_start: date, db: SessionLocal = Depends(get_db)):
    """Trigger the scheduling engine for a specific store and week.

    Returns a dictionary with either ``assignments`` or an ``error`` field.
    """
    result = run_scheduler(store_id, week_start)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/store/{store_id}/schedule", response_model=ScheduleResponse)
def get_store_schedule(store_id: int, week_start: date, db: SessionLocal = Depends(get_db)):
    """Return a weekly schedule for a store.

    The implementation currently returns empty lists for ``shifts`` and
    ``employees`` – a full implementation would map the ORM objects to the
    Pydantic response models.
    """
    from ..models import Shift, ScheduledAssignment, Employee
    week_end = week_start + timedelta(days=7)
    shifts = (
        db.query(Shift)
        .filter(
            Shift.store_id == store_id,
            Shift.date >= week_start,
            Shift.date < week_end,
        )
        .all()
    )
    # Placeholder – real data mapping omitted for brevity.
    return ScheduleResponse(week_start=week_start, store_id=store_id, shifts=[], employees=[])
