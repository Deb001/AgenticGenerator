from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Request, Response, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for extracting token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare a plain password with a bcrypt hashed password.

    Args:
        plain_password: The password provided by the user.
        hashed_password: The stored bcrypt hash.
    Returns:
        True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain password using bcrypt.

    Args:
        password: The plain password.
    Returns:
        A bcrypt hash of the password.
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT token.

    Args:
        data: Payload data to encode (must contain a "sub" key for user id).
        expires_delta: Optional custom expiration delta.
    Returns:
        A JWT as a string.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Validate a JWT token and return its payload.

    Args:
        token: JWT token string.
    Returns:
        Decoded payload as a dictionary.
    Raises:
        HTTPException: If token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if "sub" not in payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload missing subject")
        return payload
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials") from e


def add_security_headers(app):
    """Install middleware that adds common security headers to every response.

    Args:
        app: FastAPI application instance.
    """
    @app.middleware("http")
    async def security_headers_middleware(request: Request, call_next):
        response: Response = await call_next(request)
        # Content Security Policy – restrict to self and allow styles/scripts from self
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        # HTTP Strict Transport Security – 1 year
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # MIME sniffing protection
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Referrer policy
        response.headers["Referrer-Policy"] = "no-referrer"
        return response
