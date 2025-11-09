'''Configuration constants for the Flask application.

This module is imported by ``app.py``, ``models.py`` and ``seed.py`` to obtain
the database connection string and the debug flag.
'''

# Database connection string – using SQLite for simplicity. Change to a
# PostgreSQL URI (e.g. ``postgresql://user:pass@host/dbname``) for production.
SQLALCHEMY_DATABASE_URI: str = "sqlite:///app.db"

# Enable Flask debug mode when running locally.
DEBUG: bool = True

__all__ = ["SQLALCHEMY_DATABASE_URI", "DEBUG"]