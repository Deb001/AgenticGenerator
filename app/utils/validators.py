import re
from typing import Any

def is_valid_email(email: Any) -> bool:
    """Return True if *email* is a non‑empty string matching a simple email pattern.

    The function safely returns ``False`` for any non‑string input.
    """
    if not isinstance(email, str):
        return False
    pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
    return re.fullmatch(pattern, email) is not None
