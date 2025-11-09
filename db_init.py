import logging
from flask import Flask
from config import Config
from models import db, Employee, Shift


def init_db() -> None:
    """Create all tables and insert demo employees.

    This function:
        1. Instantiates a temporary Flask app and loads configuration.
        2. Binds the SQLAlchemy ``db`` instance to the app.
        3. Calls ``db.create_all()`` to create tables.
        4. Inserts three demo employees (Alice, Bob, Carol) if they do not already exist.
        5. Commits the transaction or rolls back on error.
    """

    # Configure basic logging for this utility
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Step 1 – temporary Flask application
    app = Flask(__name__)
    app.config.from_object(Config)

    # Step 2 – bind SQLAlchemy to the Flask app
    db.init_app(app)

    # Step 3 – create tables within the application context
    with app.app_context():
        try:
            db.create_all()
            # Avoid duplicate seeding on repeated runs
            if Employee.query.first():
                logger.info("Demo employees already present – skipping seeding.")
                return

            # Step 4 – add demo employees
            demo_employees = [
                Employee(name="Alice", max_shifts_per_week=5),
                Employee(name="Bob", max_shifts_per_week=5),
                Employee(name="Carol", max_shifts_per_week=5),
            ]
            db.session.add_all(demo_employees)
            db.session.commit()
            logger.info("Demo employees added successfully.")
        except Exception as exc:
            # Step 5 – rollback and log the error
            db.session.rollback()
            logger.exception("Failed to initialize the database: %s", exc)
            raise
