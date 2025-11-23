from datetime import date, datetime, timedelta, time
from typing import List, Dict
from sqlalchemy.orm import Session
from .models import Store, Employee, Shift, ScheduledAssignment, Availability
from .validators import validate_assignment
from .database import SessionLocal

# ---------------------------------------------------------------------------
# Shift configuration – three 8‑hour blocks per day.
# ---------------------------------------------------------------------------
SHIFT_TYPES = ["Morning", "Afternoon", "Evening"]
SHIFT_HOURS = {
    "Morning": (time(6, 0), time(14, 0)),
    "Afternoon": (time(14, 0), time(22, 0)),
    "Evening": (time(22, 0), time(6, 0)),  # overnight
}


def _create_shifts(db: Session, store_id: int, week_start: date) -> List[Shift]:
    """Create missing Shift rows for a whole week.

    The function is idempotent – it only adds rows that do not already exist.
    """
    created: List[Shift] = []
    for day_offset in range(7):
        cur_date = week_start + timedelta(days=day_offset)
        for st in SHIFT_TYPES:
            # Check if the shift already exists to avoid duplicates
            exists = (
                db.query(Shift)
                .filter(
                    Shift.store_id == store_id,
                    Shift.date == cur_date,
                    Shift.shift_type == st,
                )
                .first()
            )
            if exists:
                continue
            start, end = SHIFT_HOURS[st]
            # For overnight shift we keep the end_time as 06:00 – the validator will treat it as next‑day.
            shift = Shift(
                date=cur_date,
                shift_type=st,
                start_time=start,
                end_time=end,
                store_id=store_id,
            )
            db.add(shift)
            created.append(shift)
    db.commit()
    return created


def run_scheduler(store_id: int, week_start: date) -> Dict[str, List[Dict]]:
    """Generate a schedule for a given store and week.

    The algorithm is a simple greedy approach that respects the business rules
    defined in :pyfunc:`backend.app.validators.validate_assignment`.  It returns
    a dictionary with either an ``assignments`` key (list of successful
    assignments) or an ``error`` key describing why scheduling failed.
    """
    db = SessionLocal()
    try:
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            raise ValueError("Store not found")

        # Ensure all 21 shifts (7 days × 3 types) exist.
        _create_shifts(db, store_id, week_start)

        employees = db.query(Employee).filter(Employee.store_id == store_id).all()
        if not employees:
            return {"error": "No employees found for store"}

        assignments_created: List[Dict] = []

        # Pre‑compute existing assignments per employee for the week to speed up look‑ups.
        week_end = week_start + timedelta(days=7)
        employee_assignments: Dict[int, List[ScheduledAssignment]] = {
            emp.id: db.query(ScheduledAssignment)
            .join(Shift)
            .filter(
                ScheduledAssignment.employee_id == emp.id,
                Shift.date >= week_start,
                Shift.date < week_end,
            )
            .all()
            for emp in employees
        }

        # Iterate over shifts ordered by date (and implicitly by type because of insertion order).
        shifts = (
            db.query(Shift)
            .filter(
                Shift.store_id == store_id,
                Shift.date >= week_start,
                Shift.date < week_end,
            )
            .order_by(Shift.date, Shift.shift_type)
            .all()
        )

        for shift in shifts:
            # Skip already assigned shifts (could happen if the scheduler is re‑run).
            if shift.assignment:
                continue

            # Sort employees by the number of assignments they already have this week (fewest first).
            emp_counts = {
                emp.id: len(employee_assignments[emp.id]) for emp in employees
            }
            sorted_emps = sorted(employees, key=lambda e: emp_counts[e.id])

            assigned = False
            for emp in sorted_emps:
                # Availability check
                unavailable = (
                    db.query(Availability)
                    .filter(
                        Availability.employee_id == emp.id,
                        Availability.date == shift.date,
                        Availability.unavailable.is_(True),
                    )
                    .first()
                )
                if unavailable:
                    continue

                # Validate business rules
                violations = validate_assignment(emp, shift, employee_assignments[emp.id])
                if violations:
                    continue

                # Create assignment
                assignment = ScheduledAssignment(shift_id=shift.id, employee_id=emp.id)
                db.add(assignment)
                db.commit()
                assignments_created.append({"shift_id": shift.id, "employee_id": emp.id})

                # Update in‑memory cache
                employee_assignments[emp.id].append(assignment)
                assigned = True
                break

            if not assigned:
                db.rollback()
                return {"error": f"No feasible assignment for shift {shift.id} on {shift.date}"}

        return {"assignments": assignments_created}
    finally:
        db.close()
