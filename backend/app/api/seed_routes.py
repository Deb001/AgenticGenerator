from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.seed import seed_data

router = APIRouter()

@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
def run_seed(db: Session = Depends(get_db)):
    try:
        seed_data(db)
        return {"detail": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
