import os


class Config(object):
    """Central Flask configuration.

    All secrets must be supplied via environment variables. On import the class
    validates that the required variables are present and raises a clear
    ``RuntimeError`` if any are missing.
    """

    # Environment (development|production)
    ENV = os.getenv('FLASK_ENV', 'development')

    # Debug mode is only enabled in development when explicitly requested
    DEBUG = os.getenv('FLASK_DEBUG', '0') == '1' and ENV != 'production'

    # Cryptographic secrets – must be set in the environment
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET = os.getenv('JWT_SECRET')

    # Database connection string
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

    # SQLAlchemy configuration
    SQLALCHEMY_TRACK_MODIFICATIONS = False


# ---------------------------------------------------------------------------
# Validation of required environment variables
# ---------------------------------------------------------------------------
_missing_vars = []
if not Config.SECRET_KEY:
    _missing_vars.append('SECRET_KEY')
if not Config.JWT_SECRET:
    _missing_vars.append('JWT_SECRET')
if not Config.SQLALCHEMY_DATABASE_URI:
    _missing_vars.append('DATABASE_URL')

if _missing_vars:
    raise RuntimeError(
        f"Missing required environment variables: {', '.join(_missing_vars)}"
    )
