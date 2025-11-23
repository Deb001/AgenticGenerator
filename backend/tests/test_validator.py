import pytest
from datetime import date, time, timedelta
from backend.app.models import Employee, Shift, ScheduledAssignment
from backend.app.validators import validate_assignment, VIOLATION_CODES


def _make_shift(d: date, stype: str, start: time, end: time) -> Shift:
    return Shift(id=0, date=d, shift_type=stype, start_time=start, end_time=end, store_id=1)


def _make_assignment(shift: Shift, employee: Employee) -> ScheduledAssignment:
    # ``shift`` relationship is set manually for validator convenience.
    assign = ScheduledAssignment(id=0, shift_id=shift.id, employee_id=employee.id)
    assign.shift = shift
    return assign


def test_max_shifts_per_week_violation():
    emp = Employee(id=1, name="Alice", role="Cashier", store_id=1, max_shifts_per_week=2)
    week_start = date(2023, 1, 2)
    existing_shifts = []
    for i in range(2):
        d = week_start + timedelta(days=i)
        s = _make_shift(d, "Morning", time(6, 0), time(14, 0))
        existing_shifts.append(_make_assignment(s, emp))
    new_shift = _make_shift(week_start + timedelta(days=3), "Afternoon", time(14, 0), time(22, 0))
    violations = validate_assignment(emp, new_shift, existing_shifts)
    assert VIOLATION_CODES["MAX_SHIFTS_WEEK"] in violations


def test_overlap_violation():
    emp = Employee(id=2, name="Bob", role="Barista", store_id=1, max_shifts_per_week=5)
    d = date(2023, 1, 3)
    existing_shift = _make_shift(d, "Morning", time(6, 0), time(14, 0))
    existing_assign = _make_assignment(existing_shift, emp)
    new_shift = _make_shift(d, "Morning", time(13, 0), time(21, 0))
    violations = validate_assignment(emp, new_shift, [existing_assign])
    assert VIOLATION_CODES["OVERLAP"] in violations


def test_consecutive_violation():
    emp = Employee(id=3, name="Cara", role="Manager", store_id=1, max_shifts_per_week=5)
    d = date(2023, 1, 4)
    prev_shift = _make_shift(d - timedelta(days=1), "Evening", time(22, 0), time(6, 0))
    prev_assign = _make_assignment(prev_shift, emp)
    new_shift = _make_shift(d, "Evening", time(22, 0), time(6, 0))
    violations = validate_assignment(emp, new_shift, [prev_assign])
    assert VIOLATION_CODES["CONSECUTIVE"] in violations


def test_invalid_type_and_length():
    emp = Employee(id=4, name="Dan", role="Stock", store_id=1, max_shifts_per_week=5)
    d = date(2023, 1, 5)
    # Invalid type
    bad_type_shift = _make_shift(d, "Night", time(22, 0), time(6, 0))
    violations = validate_assignment(emp, bad_type_shift, [])
    assert VIOLATION_CODES["INVALID_TYPE"] in violations
    # Invalid length (7 hours instead of 8)
    bad_len_shift = _make_shift(d, "Morning", time(6, 0), time(13, 0))
    violations = validate_assignment(emp, bad_len_shift, [])
    assert VIOLATION_CODES["INVALID_LENGTH"] in violations


def test_valid_assignment_returns_no_violations():
    emp = Employee(id=5, name="Eve", role="Cashier", store_id=1, max_shifts_per_week=5)
    d = date(2023, 1, 6)
    shift = _make_shift(d, "Afternoon", time(14, 0), time(22, 0))
    violations = validate_assignment(emp, shift, [])
    assert violations == []
