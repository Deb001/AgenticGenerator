import smtplib
from email.message import EmailMessage
from typing import Optional

from .config import settings


def send_email(to_address: str, subject: str, body: str) -> None:
    """Send a simple plain‑text email via SMTP.

    This implementation works with any SMTP server. For local development you can run
    ``python -m smtpd -c DebuggingServer -n localhost:1025`` to capture emails on the console.
    """
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_USERNAME or "no-reply@example.com"
    msg["To"] = to_address
    msg.set_content(body)

    with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as smtp:
        if settings.EMAIL_USERNAME and settings.EMAIL_PASSWORD:
            smtp.starttls()
            smtp.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
        smtp.send_message(msg)
