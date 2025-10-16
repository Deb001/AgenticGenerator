import os
import logging
from typing import Any, Dict

import yaml

# Configure module-level logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class Config:
    """Application configuration loader.

    Loads default settings from ``config/default.yaml`` and overrides them with
    environment variables when present. The resulting configuration values are
    exposed as attributes of the :class:`Config` instance.

    Example
    -------
    >>> from app.config import Config
    >>> cfg = Config()
    >>> cfg.DEBUG
    False
    >>> cfg.PORT
    5000
    """

    _DEFAULT_PATH = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "config", "default.yaml")
    )

    def __init__(self) -> None:
        """Create a new configuration instance.

        Raises
        ------
        FileNotFoundError
            If the default configuration file cannot be located.
        yaml.YAMLError
            If the default configuration file contains invalid YAML.
        """
        logger.debug("Initializing Config")
        defaults = self._load_defaults()
        overrides = self._load_overrides(defaults)
        self._apply_configuration(overrides)

    @staticmethod
    def _cast_value(value: Any, target_type: type) -> Any:
        """Cast a string value from the environment to the target type.

        Parameters
        ----------
        value : Any
            The raw value (usually a string) to be cast.
        target_type : type
            The type to which ``value`` should be converted.

        Returns
        -------
        Any
            ``value`` converted to ``target_type`` if possible; otherwise the
            original ``value``.
        """
        if isinstance(value, target_type):
            return value

        try:
            if target_type is bool:
                lowered = str(value).strip().lower()
                if lowered in {"true", "1", "yes", "on"}:
                    return True
                if lowered in {"false", "0", "no", "off"}:
                    return False
                # Fallback: treat any non‑empty string as True
                return bool(lowered)
            if target_type is int:
                return int(value)
            if target_type is float:
                return float(value)
            if target_type is list:
                # Expect a comma‑separated string
                return [item.strip() for item in str(value).split(",") if item.strip()]
            # For other types (e.g., str) just cast
            return target_type(value)
        except (ValueError, TypeError) as exc:
            logger.warning(
                "Failed to cast environment value %r to %s: %s", value, target_type, exc
            )
            return value

    def _load_defaults(self) -> Dict[str, Any]:
        """Read the default YAML configuration.

        Returns
        -------
        dict
            Mapping of configuration keys to their default values.

        Raises
        ------
        FileNotFoundError
            If the default configuration file does not exist.
        yaml.YAMLError
            If the YAML content cannot be parsed.
        """
        logger.debug("Loading default configuration from %s", self._DEFAULT_PATH)
        if not os.path.isfile(self._DEFAULT_PATH):
            msg = f"Default configuration file not found: {self._DEFAULT_PATH}"
            logger.error(msg)
            raise FileNotFoundError(msg)

        with open(self._DEFAULT_PATH, "r", encoding="utf-8") as f:
            try:
                data = yaml.safe_load(f) or {}
                if not isinstance(data, dict):
                    raise yaml.YAMLError("Root of default.yaml must be a mapping")
                logger.info("Default configuration loaded successfully")
                return data
            except yaml.YAMLError as exc:
                logger.exception("Error parsing default configuration YAML")
                raise

    def _load_overrides(self, defaults: Dict[str, Any]) -> Dict[str, Any]:
        """Overlay environment variables onto the defaults.

        Parameters
        ----------
        defaults : dict
            The dictionary of default configuration values.

        Returns
        -------
        dict
            A new dictionary containing the merged configuration.
        """
        logger.debug("Applying environment variable overrides")
        merged = defaults.copy()
        for key, default_value in defaults.items():
            env_key = key.upper()
            if env_key in os.environ:
                raw_env = os.environ[env_key]
                casted = self._cast_value(raw_env, type(default_value))
                merged[key] = casted
                logger.debug(
                    "Overridden config %s: %s (from env %s)", key, casted, env_key
                )
        return merged

    def _apply_configuration(self, config: Dict[str, Any]) -> None:
        """Set configuration values as attributes on the instance.

        Parameters
        ----------
        config : dict
            Mapping of configuration keys to final values.
        """
        logger.debug("Applying configuration to Config instance")
        for key, value in config.items():
            setattr(self, key, value)
            logger.debug("Set attribute %s=%r", key, value)

    # Explicitly expose common attributes for static analysis / IDEs
    DEBUG: bool
    SECRET_KEY: str
    PORT: int