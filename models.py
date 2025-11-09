from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy

# SQLAlchemy instance that will be bound to the Flask application
db = SQLAlchemy()


class Employee(db.Model):
    """Represents a retail employee.

    Attributes:
        id: Primary key.
        name: Full name of the employee.
        max_shifts_per_week: Maximum number of shifts the employee may work in a week.
        shifts: Relationship to the Shift model.
        notifications: Relationship to the Notification model.
    """

    __tablename__ = "employees"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    max_shifts_per_week = db.Column(db.Integer, nullable=False, default=5)

    # One‑to‑many relationships
    shifts = db.relationship(
        "Shift", backref="employee", lazy=True, cascade="all, delete-orphan"
    )
    notifications = db.relationship(
        "Notification", backref="employee", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Employee {self.id} {self.name}>"


class Shift(db.Model):
    """Represents a single 8‑hour shift assigned to an employee.

    Attributes:
        id: Primary key.
        date: The day of the shift.
        shift_type: One of 'Morning', 'Afternoon', or 'Evening'.
        employee_id: Foreign key linking to Employee.id.
    """

    __tablename__ = "shifts"
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    shift_type = db.Column(db.String(20), nullable=False)
    employee_id = db.Column(
        db.Integer, db.ForeignKey("employees.id"), nullable=False
    )

    def __repr__(self) -> str:
        return (
            f"<Shift {self.id} {self.date.isoformat()} "
            f"{self.shift_type} employee_id={self.employee_id}>"
        )


class Notification(db.Model):
    """Stores notifications for employees (future use).

    Attributes:
        id: Primary key.
        employee_id: Foreign key linking to Employee.id.
        message: Text of the notification.
        created_at: Timestamp when the notification was created.
    """

    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(
        db.Integer, db.ForeignKey("employees.id"), nullable=False
    )
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow
    )

    def __repr__(self) -> str:
        return (
            f"<Notification {self.id} employee_id={self.employee_id} "
            f"created_at={self.created_at.isoformat()}>"
        )
