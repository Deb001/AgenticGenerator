from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import LoginRequest, Token
from app.services.auth_service import login
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login_endpoint(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint using OAuth2 password flow.

    FastAPI's OAuth2PasswordRequestForm extracts ``username`` and ``password`` fields from form data.
    ``username`` is interpreted as the email address.
    """
    login_req = LoginRequest(email=form_data.username, password=form_data.password)
    try:
        token = await login(login_req)
        return token
    except HTTPException as exc:
        raise exc

# Placeholder for token refresh (not implemented yet)
@router.post("/refresh", response_model=Token)
async def refresh_token():
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Refresh token not implemented")
