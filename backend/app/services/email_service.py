import logging
from typing import Any

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body: str, **kwargs: Any) -> None:
    """Placeholder async email sender.

    In a real project you would integrate with an SMTP server or a transactional
    email provider. Here we simply log the email content.
    """
    logger.info("Sending email to %s | Subject: %s | Body: %s", to, subject, body)
