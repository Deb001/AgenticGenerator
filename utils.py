from datetime import date, timedelta
from typing import List

from models import Shift


def _validate_employee_shifts(employee_shifts: List[Shift]):
    """Validate that *employee_shifts* is a list of :class:`models.Shift` objects.

    Raises
    ------
    ValueError
        If the argument is not a list or contains non‑Shift items.
    """
    if not isinstance(employee_shifts, list):
        raise ValueError("employee_shifts must be a list of Shift objects")
    for s in employee_shifts:
        if not isinstance(s, Shift):
            raise ValueError("All items in employee_shifts must be Shift instances")


def _validate_candidate_shift(candidate_shift: Shift):
    """Validate that *candidate_shift* is a :class:`models.Shift` instance.

    Raises
    ------
    ValueError
        If the argument is not a Shift.
    """
    if not isinstance(candidate_shift, Shift):
        raise ValueError("candidate_shift must be a Shift instance")


def has_overlap(employee_shifts: List[Shift], candidate_shift: Shift) -> bool:
    """Return ``True`` if *candidate_shift* occurs on the same date as any shift in
    *employee_shifts*.

    Parameters
    ----------
    employee_shifts: List[Shift]
        Existing shifts for an employee.
    candidate_shift: Shift
        The shift we want to test.
    """
    _validate_employee_shifts(employee_shifts)
    _validate_candidate_shift(candidate_shift)
    for existing in employee_shifts:
        if existing.date == candidate_shift.date:
            return True
    return False


def has_consecutive(employee_shifts: List[Shift], candidate_shift: Shift) -> bool:
    """Return ``True`` if *candidate_shift* is directly before or after any shift in
    *employee_shifts* (i.e., the dates differ by exactly one day).
    """
    _validate_employee_shifts(employee_shifts)
    _validate_candidate_shift(candidate_shift)
    for existing in employee_shifts:
        delta = (candidate_shift.date - existing.date).days
        if abs(delta) == 1:
            return True
    return False


def weekly_shift_count(employee_shifts: List[Shift], week_start: date) -> int:
    """Count how many shifts an employee has in the week that starts on *week_start*.

    The week is considered to be seven consecutive days starting with *week_start*.
    """
    _validate_employee_shifts(employee_shifts)
    if not isinstance(week_start, date):
        raise ValueError("week_start must be a datetime.date instance")
    week_end = week_start + timedelta(days=7)
    return sum(1 for s in employee_shifts if week_start <= s.date < week_end)
