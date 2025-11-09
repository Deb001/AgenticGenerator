from datetime import date, timedelta
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


def _group_by_employee(schedule: List[Dict]) -> Dict[int, List[date]]:
    """Group schedule entries by employee returning a mapping of employee_id to list of dates.
    """
    result: Dict[int, List[date]] = {}
    for entry in schedule:
        emp_id = entry["employee_id"]
        entry_date = entry["date"]
        result.setdefault(emp_id, []).append(entry_date)
    return result


def _week_index(start: date, current: date) -> int:
    """Calculate zero‑based week index relative to *start*.
    """
    return (current - start).days // 7


def validate_schedule(schedule: List[Dict]) -> bool:
    """Validate a generated schedule.

    Checks performed
    ----------------
    * No employee works more than 5 shifts in any week.
    * No employee works on two consecutive days.
    * Each day contains exactly three shift entries (assumes three shifts per day).

    Parameters
    ----------
    schedule: List[Dict]
        List of schedule dictionaries with keys ``employee_id``, ``shift_id`` and ``date``.

    Returns
    -------
    bool
        ``True`` if the schedule satisfies all constraints, ``False`` otherwise.
    """
    if not schedule:
        logger.warning("Schedule is empty")
        return False

    # Ensure each entry has required keys and correct types
    for entry in schedule:
        if not all(k in entry for k in ("employee_id", "shift_id", "date")):
            logger.warning("Schedule entry missing required keys: %s", entry)
            return False
        if not isinstance(entry["date"], date):
            logger.warning("Schedule entry 'date' is not a datetime.date instance: %s", entry)
            return False

    # Determine the overall planning horizon start date
    all_dates = [e["date"] for e in schedule]
    start_date = min(all_dates)

    # 1. Verify each day has exactly three shift entries
    from collections import Counter
    day_counts = Counter(all_dates)
    for day, count in day_counts.items():
        if count != 3:
            logger.warning("Day %s has %d shift entries (expected 3)", day.isoformat(), count)
            return False

    # 2. Verify per‑employee weekly shift limits and consecutive‑day rule
    emp_to_dates = _group_by_employee(schedule)
    for emp_id, dates in emp_to_dates.items():
        # Sort dates for consecutive‑day detection
        sorted_dates = sorted(dates)
        # Consecutive day check
        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] - sorted_dates[i - 1] == timedelta(days=1):
                logger.warning(
                    "Employee %s assigned to consecutive days %s and %s",
                    emp_id,
                    sorted_dates[i - 1].isoformat(),
                    sorted_dates[i].isoformat(),
                )
                return False
        # Weekly shift count check (max 5 per week)
        weekly_counts: Dict[int, int] = {}
        for d in sorted_dates:
            week_idx = _week_index(start_date, d)
            weekly_counts[week_idx] = weekly_counts.get(week_idx, 0) + 1
        for week_idx, cnt in weekly_counts.items():
            if cnt > 5:
                logger.warning(
                    "Employee %s exceeds weekly shift limit: %d shifts in week %d",
                    emp_id,
                    cnt,
                    week_idx,
                )
                return False

    logger.info("Schedule validation passed")
    return True
