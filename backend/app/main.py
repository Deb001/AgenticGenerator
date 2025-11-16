from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api.router import api_router
from app.database import engine, Base, create_db_and_tables
import os

def create_app() -> FastAPI:
    app = FastAPI(title="Portfolio Advisory API", version="1.0.0")

    # CORS configuration
    origins = os.getenv("CORS_ORIGINS", "*").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Enforce HTTPS in production
    if os.getenv("ENV", "development") == "production":
        app.add_middleware(HTTPSRedirectMiddleware)

    # Session middleware for CSRF token storage (HttpOnly cookie)
    app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "defaultsession"))

    # Include API routes under versioned prefix
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

    return app

app = create_app()

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()

@app.on_event("shutdown")
async def on_shutdown():
    await engine.dispose()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=os.getenv("ENV") != "production")
