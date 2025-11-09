'''SQLAlchemy ORM model definitions.

The module defines the global ``db`` instance, which is initialised in
``app.create_app`` via ``db.init_app(app)``. All model classes are exported for
use throughout the project (e.g., in ``seed.py`` and the scheduling logic).
'''

from __future__ import annotations

from datetime import date, time
from typing import List

from flask_sqlalchemy import SQLAlchemy
import config

# Global SQLAlchemy instance – will be bound to the Flask app in ``app.create_app``.
db: SQLAlchemy = SQLAlchemy()


class Store(db.Model):
    """Retail store location.

    Attributes
    ----------
    id: int
        Primary key.
    name: str
        Human‑readable store name.
    employees: List[Employee]
        Back‑reference to employees that work at this store.
    """

    __tablename__ = "stores"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)

    # Relationship populated by ``Employee.store_id`` foreign key.
    employees = db.relationship("Employee", back_populates="store", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Store id={self.id} name={self.name}>"


class Employee(db.Model):
    """Employee that can be scheduled for shifts.

    Parameters
    ----------
    name: str
        Employee's full name.
    store_id: int
        Foreign key referencing the store the employee belongs to.
    max_weekly_shifts: int, optional
        Upper bound on the number of shifts an employee may work per week.
        Defaults to ``5``.
    """

    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey("stores.id"), nullable=False)
    max_weekly_shifts = db.Column(db.Integer, nullable=False, default=5)

    # Relationship to the Store object.
    store = db.relationship("Store", back_populates="employees")

    # Relationship to Schedule entries.
    schedules = db.relationship("Schedule", back_populates="employee", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Employee id={self.id} name={self.name} store_id={self.store_id}>"


class Shift(db.Model):
    """Shift definition (e.g., Morning, Afternoon, Evening).

    Attributes
    ----------
    id: int
        Primary key.
    name: str
        Human readable name – ``"Morning"``, ``"Afternoon"`` or ``"Evening"``.
    start_time: time
        Time the shift starts (24‑hour clock).
    end_time: time
        Time the shift ends. For overnight shifts the end time may be earlier
        than the start time (e.g., 22:00 → 06:00).
    """

    __tablename__ = "shifts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

    schedules = db.relationship("Schedule", back_populates="shift", lazy="dynamic")

    def __repr__(self) -> str:
        return (
            f"<Shift id={self.id} name={self.name} "
            f"start={self.start_time} end={self.end_time}>"
        )


class Schedule(db.Model):
    """Assignment of an employee to a shift on a particular date.

    Attributes
    ----------
    id: int
        Primary key.
    employee_id: int
        Foreign key to ``Employee``.
    shift_id: int
        Foreign key to ``Shift``.
    date: date
        Calendar day for which the shift is scheduled.
    """

    __tablename__ = "schedules"

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    shift_id = db.Column(db.Integer, db.ForeignKey("shifts.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)

    employee = db.relationship("Employee", back_populates="schedules")
    shift = db.relationship("Shift", back_populates="schedules")

    __table_args__ = (
        db.UniqueConstraint("employee_id", "shift_id", "date", name="uq_employee_shift_date"),
    )

    def __repr__(self) -> str:
        return (
            f"<Schedule id={self.id} employee_id={self.employee_id} "
            f"shift_id={self.shift_id} date={self.date}>"
        )

__all__ = ["db", "Store", "Employee", "Shift", "Schedule"]