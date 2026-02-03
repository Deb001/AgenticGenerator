from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user, rate_limiter
from ..schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    EmailVerificationRequest,
    OAuthCallbackRequest,
)
from ..services.auth_service import AuthService
from ..services.oauth_service import OAuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(
    payload: SignupRequest,
    db: Session = Depends(get_db),
    limiter=Depends(rate_limiter),
):
    service = AuthService(db)
    user = service.signup(
        email=payload.email, password=payload.password, full_name=payload.full_name
    )
    tokens = service.login(email=payload.email, password=payload.password)
    response = JSONResponse(content={"access_token": tokens["access_token"]})
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return response


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
    limiter=Depends(rate_limiter),
):
    service = AuthService(db)
    tokens = service.login(email=payload.email, password=payload.password)
    response = JSONResponse(content={"access_token": tokens["access_token"]})
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return response


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing"
        )
    service = AuthService(db)
    tokens = service.refresh(refresh_token)
    response = JSONResponse(content={"access_token": tokens["access_token"]})
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return response


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        service = AuthService(db)
        service.logout(refresh_token)
    response = JSONResponse(content={"detail": "Logged out"})
    response.delete_cookie(key="refresh_token")
    return response


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.verify_email(token)
    return {"detail": f"Email {user.email} verified"}


# Google OAuth endpoints
@router.get("/google/login")
def google_login(state: str = "default", db: Session = Depends(get_db)):
    service = OAuthService(db)
    auth_url = service.get_google_authorization_url(state)
    response = JSONResponse(content={"auth_url": auth_url})
    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return response


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    service = OAuthService(db)
    result = await service.handle_google_callback(request)
    response = JSONResponse(content={"access_token": result["access_token"]})
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return response
