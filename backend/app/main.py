from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import scheduler, stores, employees, shifts
from .config import settings

app = FastAPI(title="Retail Workforce Scheduler", version="0.1.0")

# Allow all origins – in production this should be restricted.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scheduler.router, prefix="/api/scheduler", tags=["Scheduler"])
app.include_router(stores.router, prefix="/api/stores", tags=["Stores"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(shifts.router, prefix="/api/shifts", tags=["Shifts"])
