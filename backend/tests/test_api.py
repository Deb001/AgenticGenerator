import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.models import Store, Employee

client = TestClient(app)

@pytest.fixture(scope="function")
def prepared_db():
    # Reset DB and seed minimal data.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        store = Store(name="Test Store", timezone="UTC")
        db.add(store)
        db.commit()
        db.refresh(store)
        employees = [
            Employee(name="Alice", role="Cashier", store_id=store.id),
            Employee(name="Bob", role="Barista", store_id=store.id),
            Employee(name="Cara", role="Manager", store_id=store.id),
            Employee(name="Dan", role="Stock", store_id=store.id),
            Employee(name="Eve", role="Cashier", store_id=store.id),
        ]
        db.add_all(employees)
        db.commit()
        yield store.id
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_scheduler_endpoint(prepared_db):
    store_id = prepared_db
    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
    response = client.post(
        "/api/scheduler/run",
        json={"store_id": store_id, "week_start": week_start},
    )
    assert response.status_code == 200
    json_data = response.json()
    assert "assignments" in json_data
    assert len(json_data["assignments"]) == 21

def test_get_store_schedule_endpoint(prepared_db):
    store_id = prepared_db
    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
    # Ensure the scheduler has run so that shifts exist.
    client.post(
        "/api/scheduler/run",
        json={"store_id": store_id, "week_start": week_start},
    )
    response = client.get(
        f"/api/scheduler/store/{store_id}/schedule",
        params={"week_start": week_start},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["store_id"] == store_id
    assert data["week_start"] == week_start
