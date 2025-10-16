# System Architecture Overview

This document provides a comprehensive description of the architecture for the **Flask Calculator** application. It outlines the high‑level components, their interactions, deployment topology, and operational considerations such as security, scaling, and monitoring.

---

## Table of Contents

1. [High‑Level Overview](#high-level-overview)  
2. [Component Diagram](#component-diagram)  
3. [Client‑Server Interaction Flow](#client-server-interaction-flow)  
4. [Flask Blueprint Structure](#flask-blueprint-structure)  
5. [Static Asset Serving](#static-asset-serving)  
6. [Docker Containerization](#docker-containerization)  
7. [Deployment Topology](#deployment-topology)  
8. [Security Considerations](#security-considerations)  
9. [Scalability & Monitoring](#scalability--monitoring)  
10. [Development & CI/CD Workflow](#development--cicd-workflow)  

---

## High‑Level Overview

The application is a **single‑page web calculator** built with:

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Presentation** | HTML5, CSS3, JavaScript (ES6) | Render UI, capture user input, invoke backend API |
| **API / Business Logic** | Flask (Python 3.11) | Validate requests, perform calculations, return JSON |
| **Container Runtime** | Docker | Isolate environment, guarantee reproducibility |
| **Orchestration (optional)** | Docker‑Compose | Spin up Flask service (and optional reverse proxy) for local development and CI pipelines |

All configuration values (e.g., `FLASK_ENV`, `SECRET_KEY`) are externalized via environment variables and documented in `.env.example`.

---

## Component Diagram

graph TD
    subgraph Client
        UI[Browser UI<br/>HTML/CSS/JS]
    end

    subgraph DockerContainer[Docker Container]
        FlaskApp[Flask App (src/app.py)]
        Blueprint[Routes Blueprint (src/routes.py)]
        Templates[Templates (src/templates/)]
        Static[Static Assets (src/static/)]
    end

    subgraph Host
        DockerEngine[Docker Engine]
    end

    UI -->|HTTP GET /| FlaskApp
    UI -->|XHR POST /api/calculate| FlaskApp
    FlaskApp --> Blueprint
    Blueprint --> Templates
    Blueprint --> Static
    FlaskApp -->|Serves| Templates
    FlaskApp -->|Serves| Static
    DockerEngine --> DockerContainer

---

## Client‑Server Interaction Flow

1. **Initial Page Load**  
   - Browser requests `GET /`.  
   - Flask serves `index.html` from the `templates` directory.  
   - The HTML references CSS (`/static/css/style.css`) and JS (`/static/js/app.js`).

2. **User Submits a Calculation**  
   - JavaScript captures the form data and sends a **JSON** payload via `fetch` to `POST /api/calculate`.  
   - The request body is validated (type, range, required fields).  

3. **Backend Processing**  
   - The `calculate` view (registered in `routes.py`) parses the JSON, performs the arithmetic operation, and returns a JSON response:  
          { "result": 42.0 }
        - Errors (e.g., division by zero, malformed JSON) are caught and returned with appropriate HTTP status codes (`400 Bad Request`, `422 Unprocessable Entity`).

4. **Result Rendering**  
   - The client receives the JSON response, updates the DOM, and displays the result without a full page reload.

All network traffic is **stateless** and can be load‑balanced across multiple container instances.

---

## Flask Blueprint Structure

The Flask application follows a modular blueprint pattern to keep concerns separated:

src/
├── app.py          # Application factory, error handlers, logging config
└── routes.py       # Blueprint registration and endpoint definitions

### `app.py` (simplified)

from flask import Flask
from .routes import api_bp

def create_app() -> Flask:
    """Factory that creates and configures the Flask application."""
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_prefixed_env()   # Loads FLASK_*, SECRET_KEY, etc.
    app.register_blueprint(api_bp)
    return app

### `routes.py`

from flask import Blueprint, request, jsonify, render_template, current_app
from werkzeug.exceptions import BadRequest, UnprocessableEntity

api_bp = Blueprint('api', __name__)

@api_bp.route('/', methods=['GET'])
def index():
    """Render the main UI page."""
    return render_template('index.html')

@api_bp.route('/api/calculate', methods=['POST'])
def calculate():
    """Validate input, perform calculation, and return JSON result."""
    # Validation and error handling omitted for brevity (see source)
    ...

The blueprint isolates API routes from the core app, making future expansion (e.g., versioned APIs) straightforward.

---

## Static Asset Serving

Flask automatically serves files placed under `src/static/` at the URL prefix `/static/`. The directory layout is:

src/static/
├── css/
│   └── style.css
└── js/
    └── app.js

* **Cache‑Control** – In production, the Docker image can be built with a reverse proxy (e.g., Nginx) that adds `Cache-Control: max-age=31536000, immutable` for immutable assets.
* **Security** – Flask’s built‑in static file handler sanitizes the request path, preventing directory traversal attacks.

---

## Docker Containerization

### Dockerfile (excerpt)

# Use official Python slim image
FROM python:3.11-slim

# Set environment variables for non‑interactive install
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

# Create a non‑root user
RUN useradd --create-home appuser
WORKDIR /home/appuser

# Copy dependency list and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY src/ src/
COPY .env.example .env.example

# Switch to non‑root user
USER appuser

# Expose Flask default port
EXPOSE 5000

# Entrypoint runs the Flask development server (override in prod)
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]

* **Layering** – Dependencies are installed before copying the source to leverage Docker cache.
* **Non‑root Execution** – Reduces attack surface.
* **Environment‑Driven Config** – All runtime configuration is read from environment variables; the container image contains no secrets.

### docker‑compose.yml (excerpt)

version: "3.9"
services:
  web:
    build: .
    ports:
      - "5000:5000"
    env_file:
      - .env.example
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/"]
      interval: 30s
      timeout: 5s
      retries: 3

The compose file enables a single‑command local development environment and can be extended with a reverse proxy (e.g., Traefik, Nginx) for TLS termination.

---

## Deployment Topology

+-------------------+        +-------------------+        +-------------------+
|   Client Browser  | <----> |   Load Balancer   | <----> |  Docker Swarm /   |
| (HTML/JS/CSS)     |        | (optional)        |        |  Kubernetes Pod   |
+-------------------+        +-------------------+        +-------------------+
                                   |
                                   v
                           +-------------------+
                           |  Flask Container  |
                           |  (api + static)   |
                           +-------------------+

* **Stateless Service** – Each container instance can serve any request; session state is not stored server‑side.
* **Horizontal Scaling** – Adding more containers behind a load balancer increases throughput linearly.
* **Observability** – Export logs to stdout (captured by Docker) and expose a `/health` endpoint for orchestration health checks.

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Input Validation** | All API payloads are validated against a strict schema (numeric types, allowed operators). |
| **Cross‑Site Scripting (XSS)** | UI sanitizes any dynamic content; server never reflects raw user input. |
| **CSRF** | The API is stateless and expects JSON with `Content-Type: application/json`; browsers do not send cookies, eliminating CSRF surface. |
| **Secret Management** | `SECRET_KEY` and other secrets are injected via environment variables; never hard‑coded. |
| **Dependency Hygiene** | `requirements.txt` pins exact versions; CI runs `pip-audit` to detect known vulnerabilities. |
| **Container Hardening** | Non‑root user, minimal base image, and read‑only filesystem (can be enforced in production). |

---

## Scalability & Monitoring

* **Horizontal Scaling** – Deploy multiple replicas behind a reverse proxy or cloud load balancer.  
* **Metrics** – Flask can expose Prometheus metrics via the `prometheus_flask_exporter` extension (optional).  
* **Logging** – Structured JSON logs are emitted to stdout; log aggregation platforms (ELK, Loki) can ingest them.  
* **Health Checks** – `/health` endpoint returns `200 OK` when the app can successfully import its configuration and connect to any required services.

---

## Development & CI/CD Workflow

1. **Local Development**  
   - Run `docker compose up --build` to start the service.  
   - Hot‑reload is enabled via Flask’s `debug` mode (controlled by `FLASK_ENV=development`).  

2. **Testing**  
   - Unit tests (`tests/unit/`) validate route logic.  
   - Integration tests (`tests/integration/`) spin up the container using `pytest-docker` or similar fixtures.  

3. **Continuous Integration**  
   - GitHub Actions pipeline runs:  
     - `flake8` / `black` for style enforcement.  
     - `pytest` with coverage.  
     - Docker build and scan (`docker scan`).  

4. **Continuous Deployment**  
   - On merge to `main`, the pipeline pushes the Docker image to a registry and triggers a rolling update in the target environment (e.g., Kubernetes Deployment).  

---

## Glossary

| Term | Definition |
|------|------------|
| **Blueprint** | Flask construct that groups related routes and can be registered on an application instance. |
| **Stateless** | No server‑side session data; each request contains all information needed to be processed. |
| **Health Check** | Endpoint used by orchestrators to verify that the service is alive and ready to receive traffic. |
| **Reverse Proxy** | Optional component (e.g., Nginx) that terminates TLS, serves static assets, and forwards API calls to the Flask container. |

---

*Document version:* `1.0.0` – generated on `2025-10-16`.  
*Author:* AI‑Generated Architecture Overview.