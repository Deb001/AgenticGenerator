from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app import schemas
from app.indicator import compute_indicators
from app.api.dependencies import get_db
from app.auth import get_current_advisor

router = APIRouter()

@router.get("/{ticker}", response_model=schemas.IndicatorResponse)
def get_indicators(
    ticker: str,
    start: datetime = Query(..., description="Start date in ISO format"),
    end: datetime = Query(..., description="End date in ISO format"),
    db: Session = Depends(get_db),
    advisor=Depends(get_current_advisor),
):
    try:
        indicators = compute_indicators(ticker, start, end, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    # Extract series into lists aligned by date
    dates = list(indicators["sma_20"].index)
    response = schemas.IndicatorResponse(
        dates=dates,
        sma_20=indicators["sma_20"].tolist(),
        ema_20=indicators["ema_20"].tolist(),
        rsi_14=indicators["rsi_14"].tolist(),
        macd_line=indicators["macd"][0].tolist(),
        macd_signal=indicators["macd"][1].tolist(),
        macd_histogram=indicators["macd"][2].tolist(),
    )
    return response
