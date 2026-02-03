from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..schemas.user import UserProfile, UserUpdate, UserWithPortfolios
from ..services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserWithPortfolios)
def read_current_user(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    service = UserService(db)
    user = service.get_user(current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    portfolios = [
        {"id": p.id, "name": p.name, "description": p.description}
        for p in user.portfolios
    ]
    return UserWithPortfolios(
        email=user.email,
        full_name=user.full_name,
        investment_goals=user.investment_goals,
        risk_tolerance=user.risk_tolerance,
        is_verified=user.is_verified,
        portfolios=portfolios,
    )


@router.patch("/me", response_model=UserProfile)
def update_current_user(
    payload: UserUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    updated = service.update_profile(user_id=current_user.id, updates=payload)
    return UserProfile(
        email=updated.email,
        full_name=updated.full_name,
        investment_goals=updated.investment_goals,
        risk_tolerance=updated.risk_tolerance,
        is_verified=updated.is_verified,
    )
