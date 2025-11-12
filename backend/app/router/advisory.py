from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.schemas import AdvisoryResponse
from backend.app.dependencies import advisor_required
from backend.app.services.advisory_engine import compute_advisory_signals
from backend.app.crud import get_portfolios_by_advisor

router = APIRouter(prefix="/advisory", tags=["advisory"])


@router.get("/{portfolio_id}", response_model=AdvisoryResponse)
def get_advisory(portfolio_id: int, current_user = Depends(advisor_required)):
    """Return advisory signals for a specific portfolio.
    """
    from backend.app.dependencies import get_db
    db = next(get_db())
    portfolios = get_portfolios_by_advisor(db, current_user.id)
    portfolio = next((p for p in portfolios if p.id == portfolio_id), None)
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    signals = compute_advisory_signals(portfolio)
    return AdvisoryResponse(portfolio_id=portfolio_id, signals=signals)