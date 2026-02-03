# Backend – Portfolio Manager API

## Overview
This is a **FastAPI** backend that provides:
- Email/password signup & login with strong password policy.
- Email verification flow.
- Secure JWT access tokens and rotating refresh tokens stored as Argon2 hashes.
- Google OAuth2 login with CSRF‑protected `state` parameter.
- CRUD operations for user portfolios and portfolio items.
- Rate‑limiting, audit logging and basic security headers.

## Prerequisites
- Python **3.11+**
- `pip` (preferably inside a virtual environment)
- SQLite (default) or any database supported by SQLAlchemy. Adjust `DATABASE_URL` in the `.env` file accordingly.

## Setup
```bash
# 1️⃣ Clone the repository and cd into the backend folder
git clone <repo-url>
cd backend

# 2️⃣ Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate   # on Windows use `venv\Scripts\activate`

# 3️⃣ Install pinned dependencies
pip install -r requirements.txt

# 4️⃣ Copy the example environment file and edit the values
cp .env.example .env
# Edit .env – set a strong JWT_SECRET_KEY and your Google OAuth credentials.
```

## Running the Application
```bash
# Start the development server (auto‑reload enabled when DEBUG=True)
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be reachable at `http://localhost:8000`. Swagger UI is available at `http://localhost:8000/docs`.

## Testing
A small test suite lives under `backend/tests`. Run it with:
```bash
pytest -q
```
All tests should pass, confirming that the FastAPI app instance is created, the auth router is registered and the security utilities work as expected.

## Security Highlights
- **Password hashing** uses Argon2 via `argon2-cffi`.
- **Refresh tokens** are stored only as hashes and rotated on each use.
- **Cookies** for refresh tokens and OAuth state are set with `HttpOnly`, `Secure` and `SameSite=strict`.
- **Rate limiting** is applied globally and per‑endpoint for auth routes.
- **Content‑Security‑Policy** header is added to every response.
- **Audit logs** are emitted via the `audit_service` (stdout in this demo).

## Database Migrations
Alembic is configured for schema migrations.
```bash
# Initialise a new migration (after changing models)
alembic revision --autogenerate -m "description"
# Apply migrations
alembic upgrade head
```

---
*Generated on 2026‑02‑03*