import re

def validate_ticker(ticker: str) -> str:
    """Validate that a ticker consists of 1‑5 uppercase letters.

    Returns the normalized ticker string.
    """
    if not isinstance(ticker, str):
        raise ValueError("Ticker must be a string")
    ticker = ticker.upper().strip()
    if not re.fullmatch(r"^[A-Z]{1,5}$", ticker):
        raise ValueError(f"Invalid ticker format: {ticker}")
    return ticker

def validate_positive_float(value: float, field_name: str) -> float:
    """Ensure a numeric value is greater than zero.

    Raises ``ValueError`` with a descriptive message if validation fails.
    """
    if not isinstance(value, (int, float)):
        raise ValueError(f"{field_name} must be a number")
    if value <= 0:
        raise ValueError(f"{field_name} must be greater than zero")
    return float(value)
