from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas.portfolio import PortfolioCreate, PortfolioRead
from app.services.portfolio_service import create_portfolio, get_portfolio_metrics, generate_signal
from app.core.security import oauth2_scheme, decode_access_token
from app.db.database import get_db
from sqlalchemy.future import select
from app.models.portfolio import Portfolio
from typing import List
from datetime import date

router = APIRouter(
    prefix="/portfolios",
    tags=["portfolios"],
    dependencies=[Depends(oauth2_scheme)],
)


async def get_current_advisor(token: str = Depends(oauth2_scheme)) -> int:
    payload = decode_access_token(token)
    user_id = int(payload.get("sub"))
    return user_id


@router.post("/", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
async def create_portfolio_endpoint(portfolio_in: PortfolioCreate, advisor_id: int = Depends(get_current_advisor), db=Depends(get_db)):
    portfolio = await create_portfolio(advisor_id=advisor_id, client_name=portfolio_in.client_name)
    return portfolio


@router.get("/{portfolio_id}", response_model=PortfolioRead)
async def get_portfolio(portfolio_id: int, advisor_id: int = Depends(get_current_advisor), db=Depends(get_db)):
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    portfolio = result.scalars().first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    if portfolio.advisor_id != advisor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this portfolio")
    return portfolio


@router.get("/{portfolio_id}/metrics", response_model=List[dict])
async def portfolio_metrics(
    portfolio_id: int,
    metric_name: str = Query(..., description="Metric name to retrieve"),
    start_date: date = Query(...),
    end_date: date = Query(...),
    advisor_id: int = Depends(get_current_advisor),
    db=Depends(get_db),
):
    # Ownership check
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    portfolio = result.scalars().first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    if portfolio.advisor_id != advisor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this portfolio")
    metrics = await get_portfolio_metrics(portfolio_id, metric_name, start_date, end_date)
    # Convert to simple dicts for JSON response
    return [
        {
            "metric_name": m.metric_name,
            "metric_date": m.metric_date.isoformat(),
            "value": m.value,
        }
        for m in metrics
    ]


@router.post("/{portfolio_id}/signal", response_model=dict)
async def create_signal(
    portfolio_id: int,
    as_of: date = Query(..., description="Date for which to generate the signal"),
    advisor_id: int = Depends(get_current_advisor),
    db=Depends(get_db),
):
    # Ownership check
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    portfolio = result.scalars().first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    if portfolio.advisor_id != advisor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this portfolio")
    signal = await generate_signal(portfolio_id, as_of)
    return {
        "portfolio_id": signal.portfolio_id,
        "signal_date": signal.signal_date.isoformat(),
        "signal_type": signal.signal_type.value,
        "confidence": signal.confidence,
        "rationale": signal.rationale,
    }
