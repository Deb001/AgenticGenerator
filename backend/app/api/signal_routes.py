from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app import schemas, models
from app.advisory import generate_signal
from app.crud import create_advisory_signal
from app.api.dependencies import get_db
from app.auth import get_current_advisor

router = APIRouter()

@router.post("/generate", response_model=schemas.AdvisorySignalRead)
def generate_signal_endpoint(request: schemas.GenerateSignalRequest, db: Session = Depends(get_db), advisor=Depends(get_current_advisor)):
    try:
        signal_obj = generate_signal(request.ticker, request.date, db)
        saved_signal = create_advisory_signal(db, signal_obj)
        return saved_signal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
