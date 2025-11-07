# Portfolio Advisory Backend

This repository contains the backend service for the Portfolio Advisory application. It is built with **FastAPI**, uses **PostgreSQL** for persistence, and provides a set of RESTful endpoints for managing clients, advisors, portfolios, holdings, and signal generation.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Running with Docker Compose](#running-with-docker-compose)
- [Testing the API](#testing-the-api)
- [License](#license)

## Prerequisites
- Python 3.11 or newer
- Docker & Docker Compose (optional, for containerised deployment)
- PostgreSQL 15 (if running locally without Docker)

## Project Structure
```
root/
├─ backend/                # FastAPI application package
│   ├─ main.py             # Application entry point
│   ├─ database.py         # SQLAlchemy engine & session handling
│   ├─ models.py           # ORM model definitions
│   ├─ schemas.py          # Pydantic request/response schemas
│   ├─ auth.py             # JWT authentication utilities
│   ├─ api_routes.py       # API router definitions
│   ├─ utils.py            # Helper utilities (logging, retry, etc.)
│   ├─ ingestion_price.py # Price data ingestion pipeline
│   ├─ ingestion_buzz.py  # News buzz ingestion & sentiment analysis
│   ├─ indicator_engine.py# Technical indicator calculations
│   ├─ sector_scoring.py   # Sector‑level scoring aggregation
│   └─ signal_engine.py   # Signal generation engine
├─ frontend/               # Simple static frontend (optional)
│   ├─ index.html
│   ├─ styles.css
│   └─ main.js
├─ infra/                  # Deployment artefacts
│   ├─ Dockerfile
│   └─ docker-compose.yml
├─ .env.example            # Template for required environment variables
├─ requirements.txt        # Python dependencies
├─ README.md               # Project documentation (this file)
└─ .gitignore              # Git ignore patterns
```

## Environment Variables
Copy `.env.example` to `.env` and adjust values as needed:
```
DATABASE_URL=postgresql://postgres:example@localhost:5432/portfolio_advisory
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXP_MINUTES=60
```

## Running Locally
1. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows use `venv\Scripts\activate`
   ```
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up the database**
   Ensure PostgreSQL is running and the database defined in `DATABASE_URL` exists.
   ```bash
   createdb -U postgres portfolio_advisory
   ```
4. **Run database migrations** (if using Alembic – not included in this scaffold, but you can create tables via SQLAlchemy's `Base.metadata.create_all`).
5. **Start the FastAPI server**
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API docs will be available at `http://localhost:8000/docs`.

## Running with Docker Compose
```bash
docker compose -f infra/docker-compose.yml up --build
```
This will build the backend image, start a PostgreSQL container, and expose the API on port **8000**.

## Testing the API
You can interact with the API using **cURL**, **httpie**, **Postman**, or the automatically generated Swagger UI at `http://localhost:8000/docs`.

Example: Create a new portfolio (replace `<TOKEN>` with a valid JWT):
```bash
curl -X POST "http://localhost:8000/portfolios" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"name": "My Portfolio", "client_id": 1}'
```

## License
This project is licensed under the MIT License – see the `LICENSE` file for details.
