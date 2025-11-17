from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.utils.logger import logger
from src.db import engine, Base
from src.api.routes.auth import router as auth_router
from src.api.routes.users import router as users_router
from src.api.routes.portfolios import router as portfolios_router
from src.api.routes.signals import router as signals_router

app = FastAPI(title="Portfolio Management API", version="1.0.0")

# CORS configuration
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(portfolios_router)
app.include_router(signals_router)

@app.on_event("startup")
async def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created / verified")
    except Exception as exc:
        logger.exception("Failed to initialize database")
        raise exc

@app.on_event("shutdown")
async def on_shutdown():
    try:
        engine.dispose()
        logger.info("Database engine disposed")
    except Exception as exc:
        logger.exception("Error during shutdown")

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP error {exc.status_code}: {exc.detail}")
    return await request.app.exception_handler(HTTPException)(request, exc)
