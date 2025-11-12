from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.router import auth as auth_router
from backend.app.router import portfolio as portfolio_router
from backend.app.router import advisory as advisory_router
from backend.app.config import settings
from backend.app.database import engine, Base


def create_app() -> FastAPI:
    app = FastAPI(title="Portfolio Advisory MVP", version="0.1.0")

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(auth_router.router)
    app.include_router(portfolio_router.router)
    app.include_router(advisory_router.router)

    # Startup event: create tables if they do not exist
    @app.on_event("startup")
    async def on_startup():
        Base.metadata.create_all(bind=engine)

    # Global exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    return app