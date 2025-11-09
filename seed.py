'''Database seeding script.

The ``run_seed`` function creates the database tables (if they do not exist)
and populates them with a small set of sample data – stores, employees and the
three standard shift definitions.

It is safe to call multiple times; existing records are left untouched and
new ones are added only when they are not already present.
'''

from __future__ import annotations

from datetime import time
from typing import List

from app import create_app
from models import db, Store, Employee, Shift


def _get_or_create(model, defaults: dict | None = None, **kwargs):
    """Utility helper that mimics ``django.utils.get_or_create``.

    Parameters
    ----------
    model: db.Model subclass
        The SQLAlchemy model class to query.
    defaults: dict, optional
        Values to use when creating a new instance.
    **kwargs:
        Lookup parameters used in ``filter_by``.

    Returns
    -------
    tuple[model, bool]
        The instance and a boolean indicating whether it was created.
    """
    instance = model.query.filter_by(**kwargs).first()
    if instance:
        return instance, False
    params = {**kwargs}
    if defaults:
        params.update(defaults)
    instance = model(**params)
    db.session.add(instance)
    return instance, True


def run_seed() -> None:
    """Create tables and insert initial reference data.

    The function performs all operations inside a Flask application context.
    Errors are caught, the session is rolled back and a concise message is
    printed to ``stderr``. On success the transaction is committed.
    """
    app = create_app()
    with app.app_context():
        try:
            # Ensure all tables exist.
            db.create_all()

            # ---------- Stores ----------
            store_names = ["Downtown", "Uptown"]
            stores: List[Store] = []
            for name in store_names:
                store, created = _get_or_create(Store, name=name)
                stores.append(store)

            # ---------- Employees ----------
            employee_data = [
                {"name": "Alice Johnson", "store_name": "Downtown"},
                {"name": "Bob Smith", "store_name": "Downtown"},
                {"name": "Carol Lee", "store_name": "Uptown"},
                {"name": "David Kim", "store_name": "Uptown"},
            ]
            for emp in employee_data:
                store = next(s for s in stores if s.name == emp["store_name"])
                _get_or_create(
                    Employee,
                    defaults={"store_id": store.id},
                    name=emp["name"],
                    store_id=store.id,
                )

            # ---------- Shifts ----------
            shift_definitions = [
                {"name": "Morning", "start": time(6, 0), "end": time(14, 0)},
                {"name": "Afternoon", "start": time(14, 0), "end": time(22, 0)},
                {"name": "Evening", "start": time(22, 0), "end": time(6, 0)},
            ]
            for sd in shift_definitions:
                _get_or_create(
                    Shift,
                    defaults={"start_time": sd["start"], "end_time": sd["end"]},
                    name=sd["name"],
                    start_time=sd["start"],
                    end_time=sd["end"],
                )

            # Commit all inserts.
            db.session.commit()
            print("Database seeded successfully.")
        except Exception as exc:  # pragma: no cover – defensive programming
            db.session.rollback()
            print(f"Error during seeding: {exc}")

if __name__ == "__main__":
    run_seed()
