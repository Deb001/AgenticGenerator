from fastapi import APIRouter, Depends, HTTPException, status
from src.schemas.user import UserRead, UserUpdate
from src.services.user_service import list_users, get_user_by_id, update_user_role, delete_user
from src.api.dependencies import get_db_dependency, require_role
from src.db import Session

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(require_role("admin"))])

@router.get("", response_model=list[UserRead])
def list_users_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db_dependency)):
    return list_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserRead)
def get_user_endpoint(user_id: int, db: Session = Depends(get_db_dependency)):
    return get_user_by_id(db, user_id)

@router.patch("/{user_id}", response_model=UserRead)
def update_user_endpoint(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db_dependency)):
    if user_update.role is None and user_update.is_active is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    role = user_update.role if user_update.role is not None else "client"
    is_active = user_update.is_active if user_update.is_active is not None else True
    return update_user_role(db, user_id, role, is_active)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db_dependency)):
    delete_user(db, user_id)
    return None
