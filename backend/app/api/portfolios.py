from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..schemas.portfolio import (
    PortfolioCreate,
    PortfolioRead,
    PortfolioUpdate,
    PortfolioDetail,
    PortfolioItemCreate,
    PortfolioItemRead,
    PortfolioItemUpdate,
)
from ..services.portfolio_service import PortfolioService

router = APIRouter(prefix="/api/portfolios", tags=["portfolios"])


def get_portfolio_service(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return PortfolioService(db, user_id=current_user.id)


@router.get("/", response_model=list[PortfolioRead])
def list_portfolios(service: PortfolioService = Depends(get_portfolio_service)):
    return service.list_portfolios()


@router.post("/", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    payload: PortfolioCreate, service: PortfolioService = Depends(get_portfolio_service)
):
    return service.create_portfolio(payload)


@router.get("/{portfolio_id}", response_model=PortfolioDetail)
def get_portfolio(
    portfolio_id: int, service: PortfolioService = Depends(get_portfolio_service)
):
    portfolio = service.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found"
        )
    return portfolio


@router.patch("/{portfolio_id}", response_model=PortfolioRead)
def update_portfolio(
    portfolio_id: int,
    payload: PortfolioUpdate,
    service: PortfolioService = Depends(get_portfolio_service),
):
    try:
        return service.update_portfolio(portfolio_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    portfolio_id: int, service: PortfolioService = Depends(get_portfolio_service)
):
    try:
        service.delete_portfolio(portfolio_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return None


# Portfolio items endpoints
@router.get("/{portfolio_id}/items", response_model=list[PortfolioItemRead])
def list_items(
    portfolio_id: int, service: PortfolioService = Depends(get_portfolio_service)
):
    try:
        return service.list_items(portfolio_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/{portfolio_id}/items",
    response_model=PortfolioItemRead,
    status_code=status.HTTP_201_CREATED,
)
def add_item(
    portfolio_id: int,
    payload: PortfolioItemCreate,
    service: PortfolioService = Depends(get_portfolio_service),
):
    try:
        return service.add_item(portfolio_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch(
    "/{portfolio_id}/items/{item_id}", response_model=PortfolioItemRead
)
def update_item(
    portfolio_id: int,
    item_id: int,
    payload: PortfolioItemUpdate,
    service: PortfolioService = Depends(get_portfolio_service),
):
    try:
        return service.update_item(portfolio_id, item_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete("/{portfolio_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    portfolio_id: int,
    item_id: int,
    service: PortfolioService = Depends(get_portfolio_service),
):
    try:
        service.delete_item(portfolio_id, item_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return None
