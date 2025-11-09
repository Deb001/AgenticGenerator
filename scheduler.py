from datetime import date, timedelta
from typing import List, Dict

from models import db, Employee, Shift
from utils import has_overlap, has_consecutive, weekly_shift_count


class SchedulingError(Exception):
    """Raised when the scheduler cannot find an eligible employee for a shift."""

    def __init__(self, message: str, shift_date: date, shift_type: str):
        super().__init__(message)
        self.shift_date = shift_date
        self.shift_type = shift_type
        self.message = message

    def __str__(self) -> str:
        return f"SchedulingError on {self.shift_date} ({self.shift_type}): {self.message}"


class ShiftScheduler:
    """Encapsulates scheduling logic.

    Attributes
    ----------
    employees: List[Employee]
        All employees loaded from the database.
    shifts: List[Shift]
        Existing shift assignments loaded from the database.
    """

    def __init__(self) -> None:
        self.employees: List[Employee] = Employee.query.all()
        self.shifts: List[Shift] = Shift.query.all()

    def _employee_shifts(self, employee: Employee) -> List[Shift]:
        """Return a list of shifts already assigned to *employee* (including any that
        have been generated during the current scheduling run)."""
        return [s for s in self.shifts if s.employee_id == employee.id]

    def validate_shift_rules(self, employee: Employee, candidate_shift: Shift) -> bool:
        """Validate that assigning *candidate_shift* to *employee* respects all business
        rules.

        Rules
        -----
        * No more than 5 shifts per calendar week.
        * No overlapping shifts on the same day.
        * No consecutive day shifts.
        """
        employee_shifts = self._employee_shifts(employee)

        # Overlap rule
        if has_overlap(employee_shifts, candidate_shift):
            return False

        # Consecutive rule
        if has_consecutive(employee_shifts, candidate_shift):
            return False

        # Weekly limit rule (max 5 per week)
        week_start = candidate_shift.date - timedelta(days=candidate_shift.date.weekday())
        current_count = weekly_shift_count(employee_shifts, week_start)
        if current_count >= 5:
            return False

        return True

    def generate_schedule(self, start_date: date, end_date: date) -> Dict[date, Dict[str, int]]:
        """Generate a deterministic schedule.

        For each day in the inclusive range ``[start_date, end_date]`` the scheduler
        attempts to assign the three shift types ``["Morning", "Afternoon", "Evening"]``
        to the first employee that satisfies all validation rules.

        Returns
        -------
        Dict[date, Dict[str, int]]
            Mapping of ``date -> {shift_type: employee_id}``.
        """
        if start_date > end_date:
            raise ValueError("start_date must be on or before end_date")

        schedule: Dict[date, Dict[str, int]] = {}
        shift_types = ["Morning", "Afternoon", "Evening"]
        current = start_date
        while current <= end_date:
            schedule[current] = {}
            for shift_type in shift_types:
                # Skip if a shift already exists in DB for this date/type
                existing = next((s for s in self.shifts if s.date == current and s.shift_type == shift_type), None)
                if existing:
                    schedule[current][shift_type] = existing.employee_id
                    continue

                assigned = False
                for employee in self.employees:
                    candidate = Shift(date=current, shift_type=shift_type, employee_id=employee.id)
                    if self.validate_shift_rules(employee, candidate):
                        schedule[current][shift_type] = employee.id
                        # Add to internal list so later assignments respect the new shift
                        self.shifts.append(candidate)
                        assigned = True
                        break
                if not assigned:
                    raise SchedulingError(
                        f"No eligible employee found for {shift_type} shift.",
                        shift_date=current,
                        shift_type=shift_type,
                    )
            current += timedelta(days=1)
        return schedule

    def persist_schedule(self, schedule: Dict[date, Dict[str, int]]) -> None:
        """Persist a generated *schedule* into the database.

        The method creates :class:`models.Shift` rows for each assignment and commits
        the transaction. It runs inside a single transaction – if any insert fails the
        whole operation is rolled back.
        """
        try:
            for shift_date, assignments in schedule.items():
                for shift_type, employee_id in assignments.items():
                    # Avoid duplicate entries – check if the record already exists
                    exists = (
                        db.session.query(Shift)
                        .filter_by(date=shift_date, shift_type=shift_type, employee_id=employee_id)
                        .first()
                    )
                    if not exists:
                        new_shift = Shift(date=shift_date, shift_type=shift_type, employee_id=employee_id)
                        db.session.add(new_shift)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            raise exc
