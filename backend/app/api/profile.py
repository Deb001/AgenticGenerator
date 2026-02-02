from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..schemas import profile as profile_schema
from ..api.deps import get_current_user, get_db
from ..services import user_service

router = APIRouter()


@router.get("/me", response_model=profile_schema.ProfileResponse)
def read_profile(current_user = Depends(get_current_user)):
    return profile_schema.ProfileResponse(
        email=current_user.email,
        investment_goal=current_user.investment_goal,
        risk_tolerance=current_user.risk_tolerance,
        is_verified=current_user.is_verified,
    )


@router.put("/me", response_model=profile_schema.ProfileResponse)
def update_profile(
    update: profile_schema.ProfileUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        updated_user = user_service.update_profile(db, str(current_user.id), update)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return profile_schema.ProfileResponse(
        email=updated_user.email,
        investment_goal=updated_user.investment_goal,
        risk_tolerance=updated_user.risk_tolerance,
        is_verified=updated_user.is_verified,
    )
