from datetime import datetime, timedelta
from typing import List
from .models import ScheduledAssignment, Shift, Employee

VIOLATION_CODES = {
    "MAX_SHIFTS_WEEK": "E001",
    "OVERLAP": "E002",
    "CONSECUTIVE": "E003",
    "INVALID_TYPE": "E004",
    "INVALID_LENGTH": "E005",
}


def validate_assignment(employee: Employee, new_shift: Shift, existing_assignments: List[ScheduledAssignment]) -> List[str]:
    """Validate a potential assignment.

    Args:
        employee: The employee to be assigned.
        new_shift: The shift we want to assign.
        existing_assignments: All current assignments for the employee.

    Returns:
        A list of violation codes. Empty list means the assignment is valid.
    """
    violations: List[str] = []

    # 1. Max shifts per week
    week_start = new_shift.date - timedelta(days=new_shift.date.weekday())
    week_end = week_start + timedelta(days=6)
    week_shifts = [a for a in existing_assignments if week_start <= a.shift.date <= week_end]
    if len(week_shifts) >= employee.max_shifts_per_week:
        violations.append(VIOLATION_CODES["MAX_SHIFTS_WEEK"])

    # 2. Overlap check
    for assign in existing_assignments:
        s = assign.shift
        if s.date == new_shift.date and not (new_shift.end_time <= s.start_time or new_shift.start_time >= s.end_time):
            violations.append(VIOLATION_CODES["OVERLAP"])
            break

    # 3. Consecutive same‑type shift on adjacent days
    prev_day = new_shift.date - timedelta(days=1)
    next_day = new_shift.date + timedelta(days=1)
    for assign in existing_assignments:
        s = assign.shift
        if (s.date == prev_day or s.date == next_day) and s.shift_type == new_shift.shift_type:
            violations.append(VIOLATION_CODES["CONSECUTIVE"])
            break

    # 4. Shift type validation (defensive)
    if new_shift.shift_type not in ["Morning", "Afternoon", "Evening"]:
        violations.append(VIOLATION_CODES["INVALID_TYPE"])

    # 5. Length validation – must be exactly 8 hours
    shift_start_dt = datetime.combine(new_shift.date, new_shift.start_time)
    shift_end_dt = datetime.combine(new_shift.date, new_shift.end_time)
    # Handle overnight shift where end_time is earlier than start_time
    if shift_end_dt <= shift_start_dt:
        shift_end_dt += timedelta(days=1)
    length_seconds = (shift_end_dt - shift_start_dt).total_seconds()
    if length_seconds != 8 * 3600:
        violations.append(VIOLATION_CODES["INVALID_LENGTH"])

    return violations
