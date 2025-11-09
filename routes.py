from datetime import date, timedelta
from flask import Blueprint, request, render_template, jsonify, Response
from sqlalchemy.exc import SQLAlchemyError

from models import Employee, Shift, db
from scheduler import ShiftScheduler, SchedulingError

api_blueprint = Blueprint('api', __name__, url_prefix='/api')


@api_blueprint.route('/manager', methods=['GET'])
def get_manager_dashboard() -> Response:
    """Render the manager dashboard with the current schedule.

    The view receives a list of all shift records ordered by date.
    """
    shifts = (
        db.session.query(Shift)
        .order_by(Shift.date.asc(), Shift.shift_type.asc())
        .all()
    )
    shift_data = [
        {
            "id": s.id,
            "date": s.date.isoformat(),
            "shift_type": s.shift_type,
            "employee_id": s.employee_id,
            "employee_name": s.employee.name if s.employee else None,
        }
        for s in shifts
    ]
    return render_template('manager_dashboard.html', shifts=shift_data)


@api_blueprint.route('/schedule', methods=['POST'])
def post_generate_schedule() -> Response:
    """Generate a schedule for a given date range.

    Expected JSON payload::
        {"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400
    start_str = data.get('start_date')
    end_str = data.get('end_date')
    if not start_str or not end_str:
        return jsonify({"error": "Both 'start_date' and 'end_date' are required"}), 400
    try:
        start_dt = date.fromisoformat(start_str)
        end_dt = date.fromisoformat(end_str)
    except ValueError:
        return jsonify({"error": "Dates must be in ISO format YYYY-MM-DD"}), 400
    scheduler = ShiftScheduler()
    try:
        schedule = scheduler.generate_schedule(start_dt, end_dt)
        scheduler.persist_schedule(schedule)
    except SchedulingError as se:
        return jsonify({"error": str(se)}), 400
    except SQLAlchemyError as db_err:
        return jsonify({"error": "Database error while persisting schedule"}), 500
    return jsonify({"message": "Schedule generated successfully", "schedule": schedule}), 200


@api_blueprint.route('/employee/<int:employee_id>', methods=['GET'])
def get_employee_view(employee_id: int) -> Response:
    """Render a view showing upcoming shifts for *employee_id*.
    """
    employee = Employee.query.get_or_404(employee_id)
    today = date.today()
    upcoming_shifts = (
        Shift.query.filter(Shift.employee_id == employee_id, Shift.date >= today)
        .order_by(Shift.date.asc())
        .all()
    )
    shift_data = [
        {
            "date": s.date.isoformat(),
            "shift_type": s.shift_type,
        }
        for s in upcoming_shifts
    ]
    return render_template('employee_view.html', employee=employee, shifts=shift_data)


@api_blueprint.route('/shifts', methods=['GET'])
def api_get_shifts() -> Response:
    """Return a JSON list of all shift records.
    """
    shifts = Shift.query.order_by(Shift.date.asc(), Shift.shift_type.asc()).all()
    result = [
        {
            "id": s.id,
            "date": s.date.isoformat(),
            "shift_type": s.shift_type,
            "employee_id": s.employee_id,
            "employee_name": s.employee.name if s.employee else None,
        }
        for s in shifts
    ]
    return jsonify(result), 200
