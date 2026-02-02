from . import email as email_core
from urllib.parse import quote_plus

def send_verification_email(to_email: str, token: str) -> None:
    verification_link = f"http://localhost:3000/verify-email?token={quote_plus(token)}"
    subject = "Verify your email address"
    body = f"Please click the following link to verify your email: {verification_link}"
    email_core.send_email(to_email, subject, body)

def send_password_reset_email(to_email: str, token: str) -> None:
    reset_link = f"http://localhost:3000/reset-password?token={quote_plus(token)}"
    subject = "Password reset request"
    body = f"Reset your password using this link (valid for 60 minutes): {reset_link}"
    email_core.send_email(to_email, subject, body)
