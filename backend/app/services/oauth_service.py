import urllib.parse
import requests
from typing import Dict

from sqlmodel import Session

from ..models.user import User, OAuthAccount
from ..core.config import settings

GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_google_authorization_url() -> str:
    """Construct the Google OAuth consent screen URL.

    Returns:
        A URL that the frontend can redirect the user to.
    """
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    return f"{GOOGLE_AUTH_ENDPOINT}?{urllib.parse.urlencode(params)}"


def exchange_code_for_tokens(code: str) -> Dict[str, str]:
    """Exchange an authorization *code* for access and ID tokens.

    Raises ``requests.HTTPError`` on failure.
    """
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    response = requests.post(GOOGLE_TOKEN_ENDPOINT, data=data)
    response.raise_for_status()
    return response.json()


def get_google_userinfo(access_token: str) -> Dict[str, str]:
    """Retrieve the user's profile information from Google.

    Returns a dictionary containing at least ``sub`` (Google user ID) and ``email``.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(GOOGLE_USERINFO_ENDPOINT, headers=headers)
    response.raise_for_status()
    return response.json()


def process_google_callback(db: Session, code: str) -> User:
    """Complete the Google OAuth flow and return a local ``User`` instance.

    If the Google account is already linked, the existing user is returned.
    Otherwise a new user is created, marked as verified, and linked.
    """
    token_data = exchange_code_for_tokens(code)
    access_token = token_data["access_token"]
    userinfo = get_google_userinfo(access_token)
    google_sub = userinfo["sub"]
    email = userinfo.get("email")

    # Look for an existing OAuthAccount
    statement = (
        db.query(OAuthAccount)
        .filter(OAuthAccount.provider == "google", OAuthAccount.provider_account_id == google_sub)
    )
    oauth_account = db.exec(statement).first()
    if oauth_account:
        user = db.get(User, oauth_account.user_id)
        return user

    # No existing link – create a new user (or link to existing email if present)
    existing_user = db.exec(select(User).where(User.email == email)).first()
    if existing_user:
        user = existing_user
    else:
        user = User(email=email, is_active=True, is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create OAuthAccount link
    oauth_account = OAuthAccount(
        user_id=user.id,
        provider="google",
        provider_account_id=google_sub,
        access_token=access_token,
        refresh_token=token_data.get("refresh_token"),
    )
    db.add(oauth_account)
    db.commit()
    return user
