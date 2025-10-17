# Flask Calculator API

A minimal, production‑ready Flask application that exposes a JSON API for performing basic arithmetic operations. The project includes:

- A clean **application factory** pattern (`src/__init__.py`, `src/app.py`)
- A single endpoint **`POST /api/calculate`** that validates input, executes the operation, and returns a structured response
- A lightweight **HTML UI** (`src/templates/index.html`) with a modern JavaScript front‑end (`src/static/js/app.js`)
- Full **Docker** support (`Dockerfile`, `docker-compose.yml`) for reproducible deployments
- Automated **CI/CD** via GitHub Actions (`.github/workflows/ci.yml`)
- Comprehensive **unit & integration tests** (`tests/test_api.py`) using `pytest`
- Environment configuration (`config.py`, `.env.example`) and sensible defaults

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Project Structure](#project-structure)  
3. [Setup & Installation](#setup--installation)  
4. [Running the Application](#running-the-application)  
5. [API Specification](#api-specification)  
6. [Testing](#testing)  
7. [Docker](#docker)  
8. [Continuous Integration](#continuous-integration)  
9. [Contributing](#contributing)  
10. [License](#license)  

---

## Prerequisites

| Tool | Minimum Version | Reason |
|------|-----------------|--------|
| Python | 3.11 | Core language |
| pip | 23.0 | Dependency management |
| Docker | 24.0 | Containerisation (optional) |
| Docker Compose | 2.20 | Multi‑container orchestration (optional) |
| Git | 2.30 | Version control |

---

## Project Structure

root/
├─ .github/
│  └─ workflows/
│     └─ ci.yml                # GitHub Actions CI pipeline
├─ .gitignore                  # Files ignored by Git
├─ .env.example                # Example environment variables
├─ Dockerfile                  # Build image for the Flask app
├─ docker-compose.yml          # Service orchestration
├─ README.md                   # ← You are here
├─ requirements.txt            # Python dependencies
├─ config.py                   # Central configuration loader
├─ src/
│  ├─ __init__.py              # Application factory
│  ├─ app.py                   # Flask app creation & blueprint registration
│  ├─ routes.py                # API endpoint implementation
│  ├─ templates/
│  │  └─ index.html            # Simple UI
│  └─ static/
│     ├─ css/
│     │  └─ style.css          # UI styling
│     └─ js/
│        └─ app.js             # Front‑end logic
└─ tests/
   ├─ __init__.py
   └─ test_api.py              # Unit & integration tests

---

## Setup & Installation

1. **Clone the repository**

      git clone https://github.com/your-org/flask-calculator-api.git
   cd flask-calculator-api
   
2. **Create a virtual environment** (recommended)

      python -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate
   
3. **Install dependencies**

      pip install --upgrade pip
   pip install -r requirements.txt
   
4. **Configure environment variables**

      cp .env.example .env
   # Edit .env if you need to change defaults (e.g., FLASK_ENV=development)
   
---

## Running the Application

### Development mode

export FLASK_APP=src.app:create_app
export FLASK_ENV=development   # Enables auto‑reload & debug toolbar
flask run

The API will be reachable at `http://127.0.0.1:5000/api/calculate` and the UI at `http://127.0.0.1:5000/`.

### Production mode (Gunicorn)

gunicorn -w 4 -b 0.0.0.0:5000 "src.app:create_app()"

---

## API Specification

**Endpoint**: `POST /api/calculate`  
**Content‑Type**: `application/json`

### Request Payload

| Field | Type | Description |
|-------|------|-------------|
| `operand1` | number | First numeric operand |
| `operand2` | number | Second numeric operand |
| `operator` | string | One of `"add"`, `"subtract"`, `"multiply"`, `"divide"` |

#### Example

{
  "operand1": 12,
  "operand2": 3,
  "operator": "divide"
}

### Successful Response (`200 OK`)

{
  "result": 4,
  "operation": "12 / 3"
}

### Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `400 Bad Request` | Missing/invalid fields, division by zero, unsupported operator | `{ "error": "Detailed error message" }` |
| `500 Internal Server Error` | Unexpected server failure | `{ "error": "Internal server error" }` |

All errors are logged with stack traces (when `FLASK_ENV=development`) and a user‑friendly message is returned to the client.

---

## Testing

The project uses **pytest** for both unit and integration tests.

# Run the full test suite
pytest -v

### Test Coverage

- **Unit tests** validate the arithmetic logic in `src.routes.calculate`.
- **Integration tests** spin up a Flask test client and exercise the `/api/calculate` endpoint, checking both success and failure scenarios.

---

## Docker

### Build the image

docker build -t flask-calculator:latest .

### Run with Docker Compose

docker compose up -d
# The service will be available at http://localhost:5000

The `docker-compose.yml` injects environment variables from `.env` (or defaults) and maps port `5000` from the container to the host.

### Stop & Clean

docker compose down --remove-orphans

---

## Continuous Integration

The repository includes a **GitHub Actions** workflow (`.github/workflows/ci.yml`) that runs on every push and pull request:

1. Checks out the code
2. Sets up Python 3.11
3. Installs dependencies
4. Lints with **ruff** (or flake8 if you prefer)
5. Executes **pytest** with coverage
6. Builds the Docker image to ensure Dockerfile validity

The CI badge can be added to the README once the workflow is active.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Write code **and** tests
4. Ensure `pytest` passes locally
5. Open a Pull Request with a clear description of the change

### Code Style

- Follow **PEP 8** (auto‑format with `ruff format` or `black`)
- Use **type hints** for public functions
- Keep documentation up‑to‑date (docstrings, README)

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

--- 

*Happy coding! 🚀*