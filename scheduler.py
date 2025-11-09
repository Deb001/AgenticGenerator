from datetime import date, timedelta
from typing import List, Dict
import logging

from models import Employee, Shift, db

logger = logging.getLogger(__name__)


def _week_number(start: date, current: date) -> int:
    """Return the week index (0‑based) relative to *start*.
    """
    return (current - start).days // 7


def generate_schedule(store_id: int, start_date: date, weeks: int = 1) -> List[Dict]:
    """Generate a shift schedule for a store.

    Parameters
    ----------
    store_id: int
        Identifier of the store for which to generate the schedule.
    start_date: date
        The first day of the planning horizon.
    weeks: int, optional
        Number of weeks to plan (default is 1).

    Returns
    -------
    List[Dict]
        A list of dictionaries, each containing ``employee_id``, ``shift_id`` and ``date``.

    Raises
    ------
    ValueError
        If a feasible assignment cannot be found for any shift.
    """
    # Fetch employees belonging to the store
    employees: List[Employee] = Employee.query.filter_by(store_id=store_id).all()
    if not employees:
        raise ValueError(f"No employees found for store {store_id}")

    # Fetch shift templates for the store (assume three shifts per day)
    shift_templates: List[Shift] = Shift.query.filter_by(store_id=store_id).order_by(Shift.id).all()
    if not shift_templates:
        raise ValueError(f"No shift definitions found for store {store_id}")

    # Prepare tracking structures
    employee_assignments: Dict[int, List[date]] = {e.id: [] for e in employees}
    weekly_shift_counts: Dict[int, Dict[int, int]] = {}
    # weekly_shift_counts[employee_id][week_index] = count

    schedule: List[Dict] = []
    total_days = weeks * 7

    for day_offset in range(total_days):
        current_day = start_date + timedelta(days=day_offset)
        week_idx = _week_number(start_date, current_day)
        for shift in shift_templates:
            assigned = False
            for employee in employees:
                # Initialise weekly counter if needed
                weekly_shift_counts.setdefault(employee.id, {})
                weekly_shift_counts[employee.id].setdefault(week_idx, 0)

                # Rule 1: Max weekly shifts (default 5, can be overridden per employee)
                max_shifts = employee.max_weekly_shifts if hasattr(employee, "max_weekly_shifts") else 5
                if weekly_shift_counts[employee.id][week_idx] >= max_shifts:
                    continue

                # Rule 2: No consecutive days (no back‑to‑back assignments)
                previous_day = current_day - timedelta(days=1)
                if previous_day in employee_assignments[employee.id]:
                    continue

                # Rule 3: No more than one shift per day per employee (implicit by assignments list)
                if current_day in employee_assignments[employee.id]:
                    continue

                # Assign employee to this shift
                employee_assignments[employee.id].append(current_day)
                weekly_shift_counts[employee.id][week_idx] += 1
                schedule.append(
                    {
                        "employee_id": employee.id,
                        "shift_id": shift.id,
                        "date": current_day,
                    }
                )
                assigned = True
                break  # Move to next shift

            if not assigned:
                raise ValueError(
                    f"Unable to assign a employee for store {store_id}, date {current_day}, shift {shift.id}"
                )

    logger.info("Generated schedule with %d entries", len(schedule))
    return schedule
