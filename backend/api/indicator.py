from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db import get_session
from backend.models import AdvisorySignal, User
from backend.schemas import SignalRead
from backend.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SignalRead])
def list_signals(
    ticker: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> List[SignalRead]:
    """Return advisory signals for a ticker within an optional date range.
    """
    query = db.query(AdvisorySignal).filter(AdvisorySignal.ticker == ticker)
    if start_date:
        query = query.filter(AdvisorySignal.date >= start_date)
    if end_date:
        query = query.filter(AdvisorySignal.date <= end_date)
    signals = query.order_by(AdvisorySignal.date.desc()).all()
    if not signals:
        raise HTTPException(status_code=404, detail="No signals found for the given ticker")
    return [SignalRead.from_orm(s) for s in signals]