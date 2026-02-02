from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlmodel import Session

from ..core.security import (
    create_access_token,
    create_email_token,
    decode_token,
    hash_password,
    verify_password,
)
from ..schemas import auth as auth_schema
from ..services import auth_service, oauth_service, email_service, audit_log_service
from ..api.deps import get_db

router = APIRouter()

# ---------------------------------------------------------------------------
# Helper to set JWT as HttpOnly cookie
# ---------------------------------------------------------------------------
def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production (HTTPS)
        samesite="strict",
        max_age=60 * 60,  # 1 hour
        path="/",
    )


@router.post("/register", response_model=auth_schema.TokenResponse)
def register(request: auth_schema.RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.register_user(db, request.email, request.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    access_token = create_access_token(str(user.id), expires_delta=timedelta(minutes=30))
    audit_log_service.log_event(db, user.id, "register", "User registered via email/password")
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    _set_auth_cookie(response, access_token)
    return response


@router.post("/login", response_model=auth_schema.TokenResponse)
def login(request: auth_schema.LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(str(user.id))
    audit_log_service.log_event(db, user.id, "login", "User logged in with email/password")
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    _set_auth_cookie(response, access_token)
    return response


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    if payload.get("type") != "email_verification":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")
    user = auth_service.verify_email(db, payload.get("sub"))
    audit_log_service.log_event(db, user.id, "email_verified", "User verified email address")
    return {"detail": "Email verified successfully"}


@router.post("/password-reset/request")
def request_password_reset(request: auth_schema.PasswordResetRequest, db: Session = Depends(get_db)):
    auth_service.initiate_password_reset(db, request.email)
    return {"detail": "If the email exists, a reset link has been sent"}


@router.post("/password-reset/confirm")
def confirm_password_reset(request: auth_schema.PasswordResetConfirm, db: Session = Depends(get_db)):
    try:
        user = auth_service.confirm_password_reset(db, request.token, request.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    audit_log_service.log_event(db, user.id, "password_reset", "User completed password reset")
    return {"detail": "Password has been reset"}


# ---------------------------------------------------------------------------
# Google OAuth flow – simplified for demonstration purposes
# ---------------------------------------------------------------------------
@router.get("/google/login")
def google_login():
    """Redirect the user to Google's OAuth consent screen."""
    auth_url = oauth_service.get_google_authorization_url()
    return RedirectResponse(url=auth_url)


@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle the OAuth callback, exchange *code* for tokens, and log the user in.

    Returns a JWT access token that the frontend can store (also set as HttpOnly cookie).
    """
    user = oauth_service.process_google_callback(db, code)
    access_token = create_access_token(str(user.id))
    audit_log_service.log_event(db, user.id, "google_login", "User logged in via Google OAuth")
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    _set_auth_cookie(response, access_token)
    return response
