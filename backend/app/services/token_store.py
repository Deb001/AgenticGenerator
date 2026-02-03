from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from ..models.auth_token import AuthToken
from ..core.security import get_password_hash as hash_token
from ..core.security import verify_password as verify_token_hash
from ..config import settings


class TokenStore:
    """Utility for persisting, revoking and verifying refresh tokens.

    Tokens are stored as Argon2 hashes; the plain token is never persisted.
    """

    def __init__(self, db: Session):
        self.db = db

    def _hash(self, token: str) -> str:
        return hash_token(token)

    def store_token(self, user_id: int, token: str) -> AuthToken:
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        token_hash = self._hash(token)
        auth_token = AuthToken(
            token_hash=token_hash,
            user_id=user_id,
            expires_at=expires_at,
            revoked=False,
        )
        self.db.add(auth_token)
        self.db.commit()
        self.db.refresh(auth_token)
        return auth_token

    def revoke_token(self, token_hash: str) -> None:
        token_obj = (
            self.db.query(AuthToken)
            .filter(AuthToken.token_hash == token_hash, AuthToken.revoked == False)
            .first()
        )
        if token_obj:
            token_obj.revoked = True
            self.db.commit()

    def verify_token(self, token: str) -> Optional[AuthToken]:
        """Return the AuthToken object if the token is valid and not revoked."""
        candidates = (
            self.db.query(AuthToken)
            .filter(AuthToken.revoked == False, AuthToken.expires_at > datetime.utcnow())
            .all()
        )
        for cand in candidates:
            if verify_token_hash(cand.token_hash, token):
                return cand
        return None
