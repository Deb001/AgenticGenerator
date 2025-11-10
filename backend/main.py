import os
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.auth import get_current_user
from backend.api.portfolio import router as portfolio_router
from backend.api.indicator import router as indicator_router
import uvicorn

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns
    -------
    FastAPI
        Configured FastAPI instance with CORS, routers, and exception handlers.
    """
    app = FastAPI(title="Advisor Backend", debug=False)

    # CORS configuration
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(portfolio_router, prefix="/api/portfolios", dependencies=[{"dependency": get_current_user}])
    app.include_router(indicator_router, prefix="/api/indicators", dependencies=[{"dependency": get_current_user}])

    # Global exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(401)
    async def unauthorized_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    @app.exception_handler(403)
    async def forbidden_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    @app.exception_handler(500)
    async def internal_error_handler(request: Request, exc: HTTPException):
        logger.exception("Internal server error: %s", exc)
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)