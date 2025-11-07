import logging
import time
from functools import wraps
from typing import Callable, Any, TypeVar

_T = TypeVar("_T")


def log_info(msg: str) -> None:
    """Log an informational message using the root logger.

    The root logger is configured on first use if no handlers are present.
    """
    if not logging.getLogger().hasHandlers():
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
        )
    logging.info(msg)


def retry(attempts: int = 3, backoff: float = 1.0) -> Callable[[Callable[..., _T]], Callable[..., _T]]:
    """Decorator that retries a function on exception.

    Args:
        attempts: Maximum number of attempts (including the first call).
        backoff: Base backoff time in seconds. The actual sleep time is
            ``backoff * 2 ** retry_count``.
    """

    def decorator(func: Callable[..., _T]) -> Callable[..., _T]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> _T:
            last_exc: Exception | None = None
            for retry_count in range(attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as exc:  # noqa: BLE001
                    last_exc = exc
                    if retry_count == attempts - 1:
                        # Exhausted attempts, re‑raise the original exception
                        raise
                    sleep_time = backoff * (2 ** retry_count)
                    log_info(
                        f"Retry {retry_count + 1}/{attempts} for {func.__name__} after exception: {exc}. "
                        f"Sleeping {sleep_time:.2f}s"
                    )
                    time.sleep(sleep_time)
            # This point is unreachable because the loop either returns or raises
            raise RuntimeError("Unexpected flow in retry decorator")

        return wrapper

    return decorator
