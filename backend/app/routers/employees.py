from fastapi import APIRouter, Depends, HTTPException
from datetime import date, timedelta
from ..schemas import ScheduleResponse
from ..database import SessionLocal

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{employee_id}/schedule", response_model=ScheduleResponse)
def get_employee_schedule(employee_id: int, week_start: date, db: SessionLocal = Depends(get_db)):
    """Fetch a single employee's schedule for a given week.

    The response currently contains empty lists – a production version would
    populate ``shifts`` and ``employees`` with the appropriate data.
    """
    from ..models import ScheduledAssignment, Shift
    week_end = week_start + timedelta(days=7)
    assignments = (
        db.query(ScheduledAssignment)
        .join(Shift)
        .filter(
            ScheduledAssignment.employee_id == employee_id,
            Shift.date >= week_start,
            Shift.date < week_end,
        )
        .all()
    )
    # Placeholder response.
    return ScheduleResponse(week_start=week_start, store_id=0, shifts=[], employees=[])
