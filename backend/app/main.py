import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api import auth, users, portfolios
from .dependencies import rate_limiter_instance
from .config import settings
from .core.security import get_password_hash, verify_password

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, debug=settings.DEBUG)

# CORS – allow all origins for development; restrict in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Content‑Security‑Policy middleware (basic protection)
@app.middleware("http")
async def csp_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    return response

# Global rate‑limit middleware (fallback for any route not using the dependency)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    if not rate_limiter_instance.is_allowed(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests, please try again later.",
        )
    response = await call_next(request)
    return response

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(portfolios.router)

@app.on_event("startup")
async def startup_event():
    # Create tables if they do not exist – useful for SQLite dev setups.
    from .db import engine, Base
    Base.metadata.create_all(bind=engine)
    logger.info("Application startup complete")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
