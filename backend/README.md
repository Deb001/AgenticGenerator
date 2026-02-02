# Portfolio Management Backend

## Overview
This is the FastAPI backend for the **Portfolio Management** application. It provides:
- Secure email/password authentication with JWTs.
- Google OAuth2 login.
- User profile management (investment goals, risk tolerance).
- CRUD operations for portfolios and portfolio items.
- Audit logging and email verification/password‑reset workflows.

## Prerequisites
- **Python 3.9+**
- **SQLite** (default) or any database supported by SQLModel (PostgreSQL, MySQL, …).
- Environment variables (see **.env.example** below).

## Setup
```bash
# Clone the repository and cd into the backend folder
git clone <repo-url>
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file (copy from .env.example) and set the required values
cp .env.example .env

# Initialise the database (creates tables)
python -c "from app.db import init_db; init_db.init_db()"
```

## Running the API
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

## Testing
```bash
pytest -q
```
All tests should pass.

## Environment Variables (.env.example)
```
# Database URL (SQLite by default)
DB_URL=sqlite:///./test.db

# JWT settings
JWT_SECRET_KEY=super-secret-key-change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email (SMTP) – for local dev you can use a debugging server
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USERNAME=
EMAIL_PASSWORD=

# Google OAuth – optional, fill only if you enable Google login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# CORS – comma‑separated list of allowed origins (frontend URL)
CORS_ORIGINS=http://localhost:5173
```

## Security Notes
- **JWTs** are returned in the response body **and** set as an `HttpOnly` secure cookie.
- Rate limiting is enforced on authentication endpoints (5 requests per minute per IP).
- CORS is restricted to the origins defined in `CORS_ORIGINS`.
- All request bodies are validated with strict Pydantic models.
- Generic error messages are returned to the client; detailed errors are logged server‑side.
- Security‑related HTTP headers are added via middleware.

---
*Generated on 2026‑02‑02*