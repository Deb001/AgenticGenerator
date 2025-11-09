import logging
from datetime import datetime, date
from typing import List, Dict

from flask import Flask, request, jsonify, send_from_directory, Response

from models import Employee, Store, Shift, Schedule, db
from scheduler import generate_schedule
from validator import validate_schedule
import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    """Create and configure the Flask application.

    Returns
    -------
    Flask
        Configured Flask application instance with routes registered and
        SQLAlchemy initialised.
    """
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config)
    db.init_app(app)

    @app.route('/static/<path:filename>', methods=['GET'])
    def get_static(filename: str) -> Response:
        """Serve static files from the ``static`` directory.

        Parameters
        ----------
        filename: str
            Relative path to the static file.
        """
        try:
            return send_from_directory('static', filename)
        except Exception as exc:
            logger.exception("Error serving static file %s", filename)
            return jsonify({"error": str(exc)}), 404

    @app.route('/api/employees', methods=['GET'])
    def api_get_employees() -> Response:
        """Return a JSON list of all employees.
        """
        try:
            employees = Employee.query.all()
            data = [
                {
                    "id": e.id,
                    "name": e.name,
                    "store_id": e.store_id,
                    "max_weekly_shifts": e.max_weekly_shifts,
                }
                for e in employees
            ]
            return jsonify(data), 200
        except Exception as exc:
            logger.exception("Failed to fetch employees")
            return jsonify({"error": str(exc)}), 500

    @app.route('/api/shifts', methods=['GET'])
    def api_get_shifts() -> Response:
        """Return a JSON list of all shift definitions.
        """
        try:
            shifts = Shift.query.all()
            data = [
                {
                    "id": s.id,
                    "name": s.name,
                    "start_time": s.start_time.isoformat(),
                    "end_time": s.end_time.isoformat(),
                    "store_id": s.store_id,
                }
                for s in shifts
            ]
            return jsonify(data), 200
        except Exception as exc:
            logger.exception("Failed to fetch shifts")
            return jsonify({"error": str(exc)}), 500

    @app.route('/api/schedule/generate', methods=['POST'])
    def api_generate_schedule() -> Response:
        """Generate a schedule for a store, validate it and persist.
        Expected JSON payload::
            {
                "store_id": int,
                "start_date": "YYYY-MM-DD",
                "weeks": int (optional, default 1)
            }
        """
        try:
            payload = request.get_json(force=True)
            store_id = int(payload["store_id"])
            start_date_str = payload["start_date"]
            weeks = int(payload.get("weeks", 1))
            start_date_obj = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except (KeyError, ValueError, TypeError) as exc:
            logger.warning("Invalid request payload: %s", exc)
            return jsonify({"error": "Invalid request payload"}), 400

        try:
            schedule_entries: List[Dict] = generate_schedule(store_id, start_date_obj, weeks)
        except ValueError as exc:
            logger.warning("Scheduling failed: %s", exc)
            return jsonify({"error": str(exc)}), 400
        except Exception as exc:
            logger.exception("Unexpected error during schedule generation")
            return jsonify({"error": "Internal server error"}), 500

        if not validate_schedule(schedule_entries):
            msg = "Generated schedule did not pass validation"
            logger.warning(msg)
            return jsonify({"error": msg}), 400

        try:
            # Persist schedule entries
            for entry in schedule_entries:
                schedule = Schedule(
                    employee_id=entry["employee_id"],
                    shift_id=entry["shift_id"],
                    date=entry["date"],
                )
                db.session.add(schedule)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            logger.exception("Database error while persisting schedule")
            return jsonify({"error": "Database error"}), 500

        return jsonify({"status": "success", "schedule": schedule_entries}), 201

    @app.route('/api/schedule/<int:store_id>', methods=['GET'])
    def api_get_schedule(store_id: int) -> Response:
        """Return stored schedule entries for a given store.
        """
        try:
            schedules = (
                db.session.query(Schedule)
                .join(Employee, Schedule.employee_id == Employee.id)
                .filter(Employee.store_id == store_id)
                .order_by(Schedule.date, Schedule.shift_id)
                .all()
            )
            data = [
                {
                    "id": s.id,
                    "employee_id": s.employee_id,
                    "shift_id": s.shift_id,
                    "date": s.date.isoformat(),
                }
                for s in schedules
            ]
            return jsonify(data), 200
        except Exception as exc:
            logger.exception("Failed to retrieve schedule for store %s", store_id)
            return jsonify({"error": str(exc)}), 500

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000, debug=False)
