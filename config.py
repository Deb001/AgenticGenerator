import os
from typing import Dict

from dotenv import load_dotenv

def load_config() -> Dict[str, str]:
    """
    Load environment variables from a .env file (if present) and construct a
    configuration dictionary.

    Returns:
        dict: Mapping of configuration keys to their string values.
    """
    # Populate os.environ from a .env file located in the project root.
    # `load_dotenv` silently ignores missing files, which is acceptable.
    load_dotenv()

    # Default configuration values.
    defaults = {
        "FLASK_ENV": "production",
        # Generate a deterministic fallback secret if none is provided.
        # Using 32 random bytes encoded as hex gives a 64‑character string.
        "SECRET_KEY": os.getenv("SECRET_KEY") or os.urandom(32).hex(),
    }

    # Override defaults with any values explicitly set in the environment.
    config = {
        key: os.getenv(key, default)
        for key, default in defaults.items()
    }

    return config

# Export a module‑level configuration dictionary for convenient import elsewhere.
CONFIG: Dict[str, str] = load_config()

__all__ = ["CONFIG", "load_config"]