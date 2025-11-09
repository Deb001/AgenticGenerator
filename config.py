import os
from pathlib import Path

class Config:
    """Central configuration object used by Flask and SQLAlchemy.

    Attributes
    ----------
    SQLALCHEMY_DATABASE_URI: str
        SQLite database file path. Defaults to ``sqlite:///retail.db`` located in the
        project root.
    SQLALCHEMY_TRACK_MODIFICATIONS: bool
        Disables Flask‑SQLAlchemy event system to save memory.
    SECRET_KEY: str
        Random secret used by Flask for session management and CSRF protection.
    """

    # Base directory of the project (directory containing this file)
    BASE_DIR = Path(__file__).resolve().parent

    # SQLite database stored in the project root
    SQLALCHEMY_DATABASE_URI: str = f"sqlite:///{BASE_DIR / 'retail.db'}"
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    # Generate a secret key; allow override via environment variable for production
    SECRET_KEY: str = os.getenv('FLASK_SECRET_KEY', os.urandom(24).hex())
