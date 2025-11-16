# Portfolio Advisory MVP

## Overview
A full‑stack web application that lets financial advisors view client portfolios of Indian equities, run technical‑indicator based advisory signals and visualise them.

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, JWT auth.
- **Frontend**: React + TypeScript, Axios, Chart.js (via react‑chartjs‑2).
- **Containerisation**: Docker Compose for local development.
- **CI**: GitHub Actions lint, test, and build Docker images.

## Quick Start (Local Development)
```bash
# Clone repo
git clone <repo-url>
cd <repo-root>

# Create .env file from example
cp .env.example .env
# Edit .env if you want custom passwords

# Start all services
docker compose up --build
```
The API will be reachable at `http://localhost:8000/api/v1` and the dashboard at `http://localhost:3000`.

The `seed` service runs once on startup and populates the database with mock Indian equity data (clients, portfolios, holdings, price series, sector scores).

## Development
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
### Frontend
```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:3000
```

## Testing
- Backend: `pytest` (covers indicator calculations, advisory logic, API endpoints).
- Frontend: `npm test` (React Testing Library).

## Security Controls
- **HTTPS**: Enforced in production via `HTTPSRedirectMiddleware`.
- **CORS**: Configurable origins via `CORS_ORIGINS`.
- **CSRF**: Session middleware stores a CSRF token; the frontend sends it as a header (implemented in Axios interceptor – omitted for brevity).
- **Secure Headers**: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` are set by FastAPI's `SecurityHeaders` middleware (implicit via Starlette).
- **Rate Limiting**: Not included in MVP but can be added via `slowapi`.
- **Authentication**: JWT stored in HttpOnly cookie; advisor role enforced by dependency `get_current_advisor`.

## Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | DB user | `postgres` |
| `POSTGRES_PASSWORD` | DB password | `postgres` |
| `POSTGRES_DB` | DB name | `portfolio` |
| `JWT_SECRET` | Secret for signing JWTs | `supersecretjwtkey` |
| `SESSION_SECRET` | Secret for session middleware | `supersecretsessionkey` |
| `CORS_ORIGINS` | Comma‑separated allowed origins | `http://localhost:3000` |
| `ENV` | `development` or `production` | `development` |

## CI/CD (GitHub Actions)
The workflow runs on every push:
- Lint Python with `ruff` and TypeScript with `eslint`.
- Run unit tests.
- Build Docker images and push to registry (requires secrets).

## License
MIT
