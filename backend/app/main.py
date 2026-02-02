import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from sqlmodel import SQLModel

from .core import config
from .core.config import settings
from .db import init_db
from .api import auth, profile, portfolios

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(title="Portfolio Management API", version="0.1.0")

# ---------------------------------------------------------------------------
# Security middleware – adds common security headers
# ---------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=()"
        # Content‑Security‑Policy – allow only self and trusted sources
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
        )
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ---------------------------------------------------------------------------
# Rate limiting – 5 requests per minute per IP on auth routes
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=[])
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS – restrict to configured origins (frontend URL)
# ---------------------------------------------------------------------------
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(portfolios.router, prefix="/api/portfolios", tags=["portfolios"])

# ---------------------------------------------------------------------------
# Startup event – initialise DB
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup() -> None:
    init_db.init_db()
    logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------------------------
# Simple health‑check endpoint
# ---------------------------------------------------------------------------
@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
