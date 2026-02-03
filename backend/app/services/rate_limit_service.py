import time
from collections import defaultdict
from typing import Callable


class SimpleRateLimiter:
    """In‑memory rate limiter for demonstration purposes.

    Tracks request timestamps per ``key`` (e.g., IP address) and enforces a
    maximum number of requests within a sliding window.
    """

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self._hits: defaultdict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        timestamps = self._hits[key]
        # Remove timestamps outside the window.
        while timestamps and timestamps[0] <= now - self.window:
            timestamps.pop(0)
        if len(timestamps) < self.max_requests:
            timestamps.append(now)
            return True
        return False

    def limit(self, key_func: Callable[[object], str]):
        """FastAPI dependency factory.

        ``key_func`` receives the request object and should return a string used
        as the rate‑limit key (commonly the client IP).
        """

        async def dependency(request):
            key = key_func(request)
            if not self.is_allowed(key):
                from fastapi import HTTPException, status

                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests, please try again later.",
                )

        return dependency
