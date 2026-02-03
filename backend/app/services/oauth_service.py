import secrets
from datetime import datetime
from typing import Dict, Any

from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings
from ..models.user import User
from ..models.oauth_account import OAuthAccount
from ..core.token import create_access_token, create_refresh_token
from ..services.auth_service import AuthService
from ..services.token_store import TokenStore
from ..services.audit_service import record

# Initialize Authlib OAuth client (Starlette integration works with FastAPI)

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


class OAuthService:
    def __init__(self, db: Session):
        self.db = db
        self.token_store = TokenStore(db)
        self.auth_service = AuthService(db)

    def get_google_authorization_url(self, state: str) -> str:
        redirect_uri = str(settings.GOOGLE_OAUTH_REDIRECT_URI)
        # The Authlib helper returns a Starlette response; we extract the URL.
        return oauth.google.authorize_redirect(redirect_uri, state=state).url

    async def handle_google_callback(self, request) -> Dict[str, Any]:
        # Verify state – compare cookie set during login.
        state_cookie = request.cookies.get("oauth_state")
        received_state = request.query_params.get("state")
        if not state_cookie or state_cookie != received_state:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OAuth state parameter",
            )
        token = await oauth.google.authorize_access_token(request)
        user_info = await oauth.google.parse_id_token(request, token)
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve user info from Google",
            )
        email = user_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account does not provide an email address",
            )
        # Find or create local user.
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, is_verified=True)
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            record(event="oauth_signup", user_id=user.id, details={"provider": "google"})
        # Upsert OAuthAccount.
        oauth_account = (
            self.db.query(OAuthAccount)
            .filter(
                OAuthAccount.provider == "google",
                OAuthAccount.provider_account_id == user_info["sub"],
                OAuthAccount.user_id == user.id,
            )
            .first()
        )
        if not oauth_account:
            oauth_account = OAuthAccount(
                provider="google",
                provider_account_id=user_info["sub"],
                access_token=token.get("access_token"),
                refresh_token=token.get("refresh_token"),
                token_expiry=datetime.utcfromtimestamp(token.get("expires_at", 0)),
                user_id=user.id,
            )
            self.db.add(oauth_account)
        else:
            oauth_account.access_token = token.get("access_token")
            oauth_account.refresh_token = token.get("refresh_token")
            oauth_account.token_expiry = datetime.utcfromtimestamp(token.get("expires_at", 0))
        self.db.commit()
        # Issue our own JWTs.
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token()
        self.token_store.store_token(user_id=user.id, token=refresh_token)
        record(event="oauth_login", user_id=user.id, details={"provider": "google"})
        return {"access_token": access_token, "refresh_token": refresh_token}
