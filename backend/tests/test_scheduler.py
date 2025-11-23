import pytest
from datetime import date, timedelta
from backend.app.database import Base, engine, SessionLocal
from backend.app.models import Store, Employee
from backend.app.scheduler import run_scheduler

@pytest.fixture(scope="function")
def db_setup():
    # Re‑create a fresh in‑memory SQLite database for each test.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed a store.
        store = Store(name="Main Street", timezone="UTC")
        db.add(store)
        db.commit()
        db.refresh(store)
        # Seed five employees.
        employees = [
            Employee(name=f"Emp{i}", role="Cashier", store_id=store.id, max_shifts_per_week=5)
            for i in range(1, 6)
        ]
        db.add_all(employees)
        db.commit()
        yield store.id
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_run_scheduler_produces_assignments(db_setup):
    store_id = db_setup
    week_start = date.today() - timedelta(days=date.today().weekday())  # Monday of current week
    result = run_scheduler(store_id, week_start)
    assert "assignments" in result
    # There are 7 days × 3 shifts = 21 assignments expected.
    assert len(result["assignments"]) == 21
