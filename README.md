# Portfolio Advisory Platform

## Overview

This repository contains a full‑stack application that provides portfolio advisory services. The backend is built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**, while the frontend (not part of this batch) will be a React/TypeScript SPA.

The **config** batch supplies all deployment‑related artifacts:
- `Dockerfile` – builds a container image for the FastAPI service.
- `docker-compose.yml` – orchestrates the backend and PostgreSQL database.
- `.env.example` – template for required environment variables.
- `requirements.txt` – pinned Python dependencies.
- `README.md` – this documentation.

## Quick Start

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and replace placeholder values with secure secrets.

2. **Build and run with Docker Compose**
   ```bash
   docker compose up --build -d
   ```
   The API will be reachable at `http://localhost:8000`.

3. **Run migrations / initialise database**
   (Assumes you have added migration scripts in a later batch.)
   ```bash
   docker compose exec backend alembic upgrade head
   ```

## Development

- **Python version**: 3.11 (slim image).
- **Hot‑reload**: Use `uvicorn backend.main:app --reload` locally (do **not** enable in production).
- **Logging**: The container logs are streamed to Docker; configure a proper logging driver for production.

## Security Considerations

- Never commit real secrets; keep them in `.env` or a secret manager.
- The container runs without root privileges (default for the slim image).
- All traffic should be served behind a TLS termination proxy (e.g., Nginx, Traefik).
- Ensure the `JWT_SECRET_KEY` is a strong, randomly generated string.

## License

MIT License.
