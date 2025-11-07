from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api_routes import router as api_router
from auth import verify_token
from database import get_db


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        An instance of ``FastAPI`` with CORS middleware, global exception
        handling, and the API router registered.
    """
    app = FastAPI(title="Portfolio Management API", version="1.0.0")

    # Allow all origins for MVP – tighten in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register the router; the router itself already includes the JWT dependency
    app.include_router(api_router)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Log the unexpected error – in a real system you might integrate with
        # a structured logging service or monitoring platform.
        import logging
        logging.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


# The ASGI entry point used by ``uvicorn``
app = create_app()
