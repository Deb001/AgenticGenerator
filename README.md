# Primitive Calculator

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9%2B-brightgreen.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

A tiny web‑based calculator built with **Flask** that demonstrates clean project structure, unit/integration testing, and containerised deployment. The API lives at `/api/calculate` and a minimal HTML UI is served from the root endpoint.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Local (virtualenv)](#local-virtualenv)
  - [Docker Compose](#docker-compose)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
  - [Development server](#development-server)
  - [Production container](#production-container)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Core arithmetic** (`add`, `subtract`, `multiply`, `divide`) in `src/calculator.py`.
- **REST API** (`POST /api/calculate`) with input validation and detailed error messages (`src/routes.py`).
- **Responsive UI** built with vanilla HTML/CSS/JS (`src/templates/index.html`, `src/static/*`).
- **Dockerised** for reproducible builds (`Dockerfile`, `docker-compose.yml`).
- **Comprehensive test suite**:
  - Unit tests (`tests/unit/test_calculator.py`)
  - Integration tests (`tests/integration/test_api.py`)
- Environment‑variable driven configuration (`.env.example`).

---

## Architecture Overview

For a deeper dive, see the [architecture documentation](docs/architecture.md). In short:

┌─────────────────────┐
│   src/app.py        │   ← Flask application factory
└───────┬─────────────┘
        │
   ┌────▼─────┐
   │ routes.py│   ← `/api/calculate` endpoint
   └────┬─────┘
        │
   ┌────▼─────┐
   │calculator│   ← pure Python arithmetic functions
   └──────────┘

Static assets and the HTML UI are served from `src/templates` and `src/static`.

---

## Prerequisites

| Tool | Minimum Version |
|------|-----------------|
| Python | 3.9 |
| pip | latest |
| Docker | 20.10+ (optional) |
| Docker Compose | 2.0+ (optional) |
| Git | any |

---

## Installation

### Local (virtualenv)

# Clone the repository
git clone https://github.com/your‑org/primitive-calculator.git
cd primitive-calculator

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

### Docker Compose

docker compose up --build

The compose file pulls the base image, installs dependencies, and starts the Flask app on port **5000** (configurable via `.env.example`).

---

## Configuration

Copy the example environment file and adjust values as needed:

cp .env.example .env

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_APP` | Flask entry point | `src/app.py` |
| `FLASK_ENV` | Development or production (`development`/`production`) | `development` |
| `FLASK_SECRET_KEY` | Secret key for session signing | `super-secret-key` |
| `PORT` | Port the app listens on | `5000` |

The Dockerfile respects these variables at build/run time.

---

## Running the Application

### Development server

# Ensure the virtualenv is active
export FLASK_APP=src/app.py
export FLASK_ENV=development
flask run --host 0.0.0.0 --port ${PORT:-5000}

Visit <http://localhost:5000> to use the UI, or send a POST request to `/api/calculate`.

### Production container

docker compose up -d

The container will be reachable at <http://localhost:5000> (or the host port you mapped).

---

## API Reference

**Endpoint:** `POST /api/calculate`

**Request JSON schema**

{
  "a": <number>,
  "b": <number>,
  "op": "add" | "subtract" | "multiply" | "divide"
}

**Responses**

- `200 OK` – Successful calculation

    {
    "result": <number>
  }
  
- `400 Bad Request` – Validation error (missing fields, unsupported operation, division by zero, etc.)

    {
    "error": "Descriptive error message"
  }
  
The implementation lives in `src/routes.py` and uses the pure functions from `src/calculator.py`.

---

## Testing

The project uses **pytest**. All tests are located under the `tests/` directory.

# Run the full suite
pytest -v

- **Unit tests** (`tests/unit/test_calculator.py`) verify each arithmetic function, including edge cases like division by zero.
- **Integration tests** (`tests/integration/test_api.py`) spin up the Flask app in test mode and exercise the `/api/calculate` endpoint.

Continuous‑integration pipelines can simply execute `pytest` after installing `requirements.txt`.

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository and create a feature branch.
2. Write **unit/integration tests** for any new functionality.
3. Ensure the test suite passes locally: `pytest -q`.
4. Update documentation (README, `docs/` files) as needed.
5. Submit a **Pull Request** with a clear description of the change.

See the full contribution guide in `CONTRIBUTING.md` (to be added) for coding standards, commit message format, and release process.

---

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

--- 

*Happy coding! 🚀*