import os
from dotenv import load_dotenv

# Load environment variables from a .env file if present.
load_dotenv()


class Config(object):
    """Application configuration loaded from environment variables.

    The class is used by ``app.__init__`` to configure Flask and its extensions.
    ``validate`` should be called during startup to ensure all required secrets
    are present.
    """

    # Core Flask settings
    FLASK_ENV: str = os.getenv('FLASK_ENV', 'production')
    DEBUG: bool = FLASK_ENV == 'development'

    # Security keys – must be provided in the environment
    SECRET_KEY: str = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY')

    # Database configuration
    SQLALCHEMY_DATABASE_URI: str = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    # JWT settings
    JWT_ACCESS_TOKEN_EXPIRES: int = 3600  # seconds (1 hour)

    @classmethod
    def validate(cls) -> None:
        """Validate that all critical configuration values are present.

        Raises:
            RuntimeError: If any required environment variable is missing.
        """
        missing = []
        if not cls.SECRET_KEY:
            missing.append('SECRET_KEY')
        if not cls.JWT_SECRET_KEY:
            missing.append('JWT_SECRET_KEY')
        if not cls.SQLALCHEMY_DATABASE_URI:
            missing.append('DATABASE_URL')
        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}"
            )
