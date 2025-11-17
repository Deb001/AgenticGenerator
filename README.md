# Financial Advisor Platform

## Overview

This repository contains a full‑stack application that provides:

- **Backend** – FastAPI service with JWT authentication, async PostgreSQL access via SQLAlchemy, and a set of domain models for users, portfolios, market data, computed metrics, and advisory signals.
- **Frontend** – A React/TypeScript single‑page application (SPA) (generated in the next batch) that consumes the backend APIs.
- **Infrastructure** – Docker Compose for local development, Alembic migrations, and a GitHub Actions CI pipeline that lints, tests, and builds Docker images.

## Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd <repo-dir>
   ```

2. **Create a `.env` file** (optional – defaults are provided in `docker-compose.yml`). Example:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/app_db
   REDIS_URL=redis://redis:6379/0
   JWT_SECRET_KEY=supersecretkeymustbe32characterslong!
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ALLOWED_HOSTS=*
   DEBUG=true
   ```

3. **Start the stack**
   ```bash
   docker-compose up --build
   ```
   This will spin up PostgreSQL, Redis, the backend API (available at `http://localhost:8000`), and the frontend (available at `http://localhost:3000`).

4. **Run database migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **API Documentation**
   Open your browser to `http://localhost:8000/docs` to explore the automatically generated OpenAPI UI.

## Project Structure

```
backend/
├─ app/
│  ├─ core/            # Configuration and security utilities
│  ├─ db/              # Async SQLAlchemy engine and session handling
│  ├─ models/          # ORM models (User, Portfolio, etc.)
│  ├─ schemas/         # Pydantic request/response models
│  ├─ services/        # Business logic (auth, portfolio)
│  ├─ api/             # FastAPI routers
│  └─ main.py          # FastAPI application entry point
├─ alembic/            # Database migration scripts
├─ Dockerfile          # Backend container image
├─ requirements.txt    # Python dependencies
└─ ...
frontend/               # React/TypeScript SPA (generated in next batch)
Docker‑compose.yml       # Local development stack
.github/workflows/ci.yml# CI pipeline
README.md               # This file
```

## Testing

The CI pipeline runs unit tests located under `backend/tests`. To run them locally:
```bash
pytest backend/tests
```
Make sure the PostgreSQL service is running and the `DATABASE_URL` environment variable points to a test database.

## CI/CD

GitHub Actions automatically:
- Lints the code with **flake8** and **mypy**.
- Executes **pytest** against a temporary PostgreSQL container.
- Builds and pushes Docker images for both backend and frontend to Docker Hub (requires `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets).

## Security Considerations

- Passwords are stored using **bcrypt** via `passlib`.
- JWTs are signed with a secret of at least 32 characters.
- Security headers (CSP, HSTS, etc.) are added via middleware.
- All database interactions use parameterised SQLAlchemy statements to prevent injection.

## Future Work (Next Batch)

The upcoming **frontend** batch will provide a React SPA with login, portfolio dashboards, and signal visualisation, consuming the APIs defined in this backend.
