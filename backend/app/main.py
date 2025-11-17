from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.portfolios import router as portfolios_router
from app.core.security import add_security_headers
import uvicorn

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, debug=settings.DEBUG)

# CORS configuration – allow origins defined in settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
add_security_headers(app)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(portfolios_router)


if __name__ == "__main__":
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=settings.DEBUG,
        )
    except Exception as exc:
        import sys, logging
        logging.error(f"Failed to start server: {exc}")
        sys.exit(1)
