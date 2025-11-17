from fastapi import APIRouter, Depends, HTTPException, status
from src.schemas.signal import SignalRead
from src.services.signal_service import compute_signal_for_ticker, recompute_all_signals
from src.api.dependencies import get_db_dependency, require_role
from src.db import Session

router = APIRouter(prefix="/signals", tags=["signals"], dependencies=[Depends(require_role("advisor"))])

@router.get("/{ticker}", response_model=SignalRead)
def get_signal_endpoint(ticker: str, db: Session = Depends(get_db_dependency)):
    return compute_signal_for_ticker(db, ticker)

@router.post("/recompute", response_model=list[SignalRead])
def recompute_signals_endpoint(db: Session = Depends(get_db_dependency)):
    return recompute_all_signals(db)
