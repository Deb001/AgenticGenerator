from fastapi import APIRouter
from app.api.auth_routes import router as auth_router
from app.api.portfolio_routes import router as portfolio_router
from app.api.indicator_routes import router as indicator_router
from app.api.signal_routes import router as signal_router
from app.api.seed_routes import router as seed_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(portfolio_router, prefix="/portfolios", tags=["portfolios"])
api_router.include_router(indicator_router, prefix="/indicators", tags=["indicators"])
api_router.include_router(signal_router, prefix="/signals", tags=["signals"])
api_router.include_router(seed_router, prefix="/seed", tags=["seed"])
