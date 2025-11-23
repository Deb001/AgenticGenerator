from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import AssignmentCreate
from ..database import SessionLocal

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{shift_id}/assign", response_model=dict)
def assign_employee(shift_id: int, payload: AssignmentCreate, db: SessionLocal = Depends(get_db)):
    """Manually assign (or re‑assign) an employee to a shift.

    Existing assignments are removed before the new one is persisted.
    """
    from ..models import Shift, ScheduledAssignment
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    # Delete any existing assignment for this shift.
    existing = db.query(ScheduledAssignment).filter(ScheduledAssignment.shift_id == shift_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    assignment = ScheduledAssignment(shift_id=shift_id, employee_id=payload.employee_id)
    db.add(assignment)
    db.commit()
    return {"msg": "Assignment updated"}
