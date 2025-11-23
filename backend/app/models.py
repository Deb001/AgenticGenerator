from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base


class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    timezone = Column(String, nullable=False)
    employees = relationship("Employee", back_populates="store")
    shifts = relationship("Shift", back_populates="store")


class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    max_shifts_per_week = Column(Integer, default=5)
    store = relationship("Store", back_populates="employees")
    assignments = relationship("ScheduledAssignment", back_populates="employee")
    availability = relationship("Availability", back_populates="employee")


class Shift(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    shift_type = Column(String, nullable=False)  # Morning, Afternoon, Evening
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    store = relationship("Store", back_populates="shifts")
    assignment = relationship("ScheduledAssignment", uselist=False, back_populates="shift")
    __table_args__ = (UniqueConstraint('date', 'shift_type', 'store_id', name='uq_shift_day_type_store'),)


class ScheduledAssignment(Base):
    __tablename__ = "scheduled_assignments"
    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False, unique=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    shift = relationship("Shift", back_populates="assignment")
    employee = relationship("Employee", back_populates="assignments")


class Availability(Base):
    __tablename__ = "availability"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    unavailable = Column(Boolean, default=False)
    employee = relationship("Employee", back_populates="availability")
    __table_args__ = (UniqueConstraint('employee_id', 'date', name='uq_employee_date'),)
