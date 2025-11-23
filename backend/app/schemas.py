from pydantic import BaseModel, Field
from datetime import date, time
from typing import List, Optional


class ShiftCreate(BaseModel):
    date: date
    shift_type: str = Field(..., regex="^(Morning|Afternoon|Evening)$")
    start_time: time
    end_time: time
    store_id: int


class AssignmentCreate(BaseModel):
    shift_id: int
    employee_id: int


class EmployeeScheduleItem(BaseModel):
    shift_id: int
    date: date
    shift_type: str
    start_time: time
    end_time: time


class StoreScheduleItem(BaseModel):
    shift_id: int
    date: date
    shift_type: str
    employee_id: Optional[int]


class ScheduleResponse(BaseModel):
    week_start: date
    store_id: int
    shifts: List[StoreScheduleItem]
    employees: List[EmployeeScheduleItem]
