import logging
from logging import getLogger, INFO, DEBUG, Formatter, StreamHandler
from pythonjsonlogger import jsonlogger
from src.config import settings

logger = getLogger("portfolio_app")
log_level = DEBUG if settings.LOG_LEVEL.upper() == "DEBUG" else INFO
logger.setLevel(log_level)

log_handler = StreamHandler()
log_formatter = jsonlogger.JsonFormatter(
    "%({asctime}s) %(levelname)s %(name)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log_handler.setFormatter(log_formatter)
logger.addHandler(log_handler)
