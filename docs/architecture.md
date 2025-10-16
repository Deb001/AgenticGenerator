# System Architecture Documentation

**Document ID:** AI-1  
**Last Updated:** 2025‑10‑16  

---

## Table of Contents

1. [Overview](#overview)  
2. [High‑Level Component Diagram](#high-level-component-diagram)  
3. [Component Breakdown](#component-breakdown)  
   - [Frontend (UI)](#frontend-ui)  
   - [Backend (API & Evaluation Engine)](#backend-api--evaluation-engine)  
   - [Docker & Containerisation](#docker--containerisation)  
   - [CI/CD Pipeline](#cicd-pipeline)  
4. [Client‑Server Interaction Flow](#client-server-interaction-flow)  
5. [Safe Evaluation Algorithm](#safe-evaluation-algorithm)  
6. [Deployment Pipeline Details](#deployment-pipeline-details)  
7. [Design Decisions & Trade‑offs](#design-decisions--trade-offs)  
8. [Scalability, Security & Observability](#scalability-security--observability)  
9. [Future Enhancements](#future-enhancements)  
10. [References](#references)  

---

## Overview

The project implements a **web‑based arithmetic calculator** with a clean separation between a lightweight Flask API and a static HTML/JS frontend. Users submit arithmetic expressions (e.g., `3 * (4 + 5)`) via the UI; the backend validates, safely evaluates, and returns the result as JSON.

Key goals:

| Goal                     | Description |
|--------------------------|-------------|
| **Safety**               | Prevent arbitrary code execution while evaluating user‑provided expressions. |
| **Portability**          | Containerised with Docker; runs identically across dev, CI, and production environments. |
| **Observability**        | Structured logging and health‑check endpoints for easy monitoring. |
| **Extensibility**        | Modular design enables future operators, authentication, or alternative frontends. |

---

## High‑Level Component Diagram

graph TD
    subgraph Frontend
        UI[HTML / CSS / JS] -->|AJAX POST /api/calculate| API
    end

    subgraph Backend
        API[Flask Routes (src/routes.py)] -->|calls| Eval[SafeEval Engine]
        Eval -->|returns| API
        API -->|JSON response| UI
    end

    subgraph Infra
        Docker[Dockerfile] -->|builds| Image[Docker Image]
        Image -->|run via| Compose[docker‑compose.yml]
        Compose -->|exposes| Port[0.0.0.0:5000]
        CI[GitHub Actions] -->|build & test| Image
    end

---

## Component Breakdown

### Frontend (UI)

| File | Purpose | Key Technologies |
|------|---------|-------------------|
| `src/templates/index.html` | Main page with input field, buttons, and result area. | HTML5, ARIA for accessibility |
| `src/static/css/style.css` | Responsive, mobile‑first styling. | CSS custom properties, BEM naming |
| `src/static/js/app.js` | Handles user events, performs AJAX POST to `/api/calculate`, updates DOM. | ES6+, `fetch`, async/await |

### Backend (API & Evaluation Engine)

| File | Purpose | Highlights |
|------|---------|------------|
| `src/app.py` | Flask application factory, registers blueprints, loads configuration, defines entry point. | Uses `create_app()` pattern for testability. |
| `src/routes.py` | `/api/calculate` endpoint: input validation, safe evaluation, error handling, JSON response. | Returns HTTP 400 for malformed input, 422 for unsafe expressions. |
| **SafeEval Engine** (implemented inside `src/routes.py`) | Parses arithmetic expressions using Python’s `ast` module, permits only `BinOp`, `UnaryOp`, `Num`, `Expression`, and a whitelist of operators (`+ - * / // % **`). | Guarantees no code execution, protects against injection. |
| `requirements.txt` | Declares Flask and its dependencies. | Pinning to stable versions. |

### Docker & Containerisation

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi‑stage build: stage 1 installs dependencies, stage 2 copies source and runs Gunicorn. |
| `docker-compose.yml` | Orchestrates the web service, maps host port 5000 → container port 5000, injects `.env` variables. |

### CI/CD Pipeline

The repository includes a **GitHub Actions** workflow (not listed in the file tree but referenced) that performs:

1. **Linting** – `flake8` with strict rules.  
2. **Unit Tests** – `pytest` runs `tests/test_app.py`.  
3. **Docker Build** – Builds the image, tags with `sha` and `latest`.  
4. **Security Scan** – `trivy` scans the built image for vulnerabilities.  
5. **Push** – On `main` branch, pushes the image to the configured container registry.

---

## Client‑Server Interaction Flow

1. **Page Load** – Browser requests `GET /` → Flask serves `index.html`.  
2. **User Input** – User types an arithmetic expression and clicks **Calculate**.  
3. **AJAX Request** – `app.js` sends a `POST` request to `/api/calculate` with JSON payload:  

      { "expression": "3 * (4 + 5)" }
   
4. **Request Validation** – `routes.py` checks:
   - Content‑type is `application/json`.
   - `expression` is a non‑empty string, length ≤ 200 characters.
5. **Safe Evaluation** – The expression is parsed into an AST, validated against the whitelist, and evaluated recursively.  
6. **Response** – On success:  

      { "result": 27 }
   
   On error: appropriate HTTP status (400/422) with `{ "error": "description" }`.  
7. **UI Update** – `app.js` displays the result or error message.

---

## Safe Evaluation Algorithm

The algorithm is deliberately **deterministic** and **side‑effect free**.

def _evaluate(node: ast.AST) -> Union[int, float]:
    """Recursively evaluate a whitelisted AST node."""
    if isinstance(node, ast.Num):                     # Python ≤3.7
        return node.n
    if isinstance(node, ast.Constant):               # Python ≥3.8
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError("Only numeric constants are allowed")
    if isinstance(node, ast.BinOp):
        left = _evaluate(node.left)
        right = _evaluate(node.right)
        op_type = type(node.op)
        if op_type is ast.Add:
            return left + right
        if op_type is ast.Sub:
            return left - right
        if op_type is ast.Mult:
            return left * right
        if op_type is ast.Div:
            return left / right
        if op_type is ast.FloorDiv:
            return left // right
        if op_type is ast.Mod:
            return left % right
        if op_type is ast.Pow:
            return left ** right
        raise ValueError(f"Unsupported binary operator {op_type.__name__}")
    if isinstance(node, ast.UnaryOp):
        operand = _evaluate(node.operand)
        if isinstance(node.op, ast.UAdd):
            return +operand
        if isinstance(node.op, ast.USub):
            return -operand
        raise ValueError(f"Unsupported unary operator {type(node.op).__name__}")
    raise ValueError(f"Disallowed AST node {type(node).__name__}")

**Key safety measures**

| Measure | Rationale |
|---------|-----------|
| **AST Whitelisting** | Only arithmetic nodes are allowed; function calls, attribute access, and comprehensions are rejected. |
| **Length & Type Checks** | Prevents extremely large payloads and non‑string inputs. |
| **Exception Mapping** | All internal `ValueError`s are translated to HTTP 422 with a generic message to avoid leaking implementation details. |
| **No `eval`/`exec`** | Eliminates the risk of arbitrary code execution. |

---

## Deployment Pipeline Details

1. **Local Development**  
      docker compose up --build
      - Hot‑reload is disabled for production parity; use `FLASK_ENV=development` to enable debug mode locally.

2. **CI Build (GitHub Actions)**  

      name: CI
   on: [push, pull_request]
   jobs:
     build-test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Python
           uses: actions/setup-python@v5
           with:
             python-version: "3.11"
         - name: Install dependencies
           run: pip install -r requirements.txt
         - name: Lint
           run: flake8 src tests
         - name: Test
           run: pytest --cov=src
         - name: Build Docker image
           run: |
             docker build -t calculator:${{ github.sha }} .
         - name: Scan image
           uses: aquasecurity/trivy-action@master
           with:
             image-ref: calculator:${{ github.sha }}
   
3. **Production Release**  
   - Image is pushed to a private registry (`registry.example.com/calculator`).  
   - Deployment uses `docker-compose.yml` with `restart: unless-stopped` and health‑check:

      healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
     interval: 30s
     timeout: 5s
     retries: 3
   
4. **Monitoring**  
   - Logs are emitted in JSON format (`logging.basicConfig(..., format='%(asctime)s %(levelname)s %(message)s')`).  
   - Exported to the host’s stdout, allowing Docker logging drivers (e.g., `json-file`, `fluentd`) to collect them.

---

## Design Decisions & Trade‑offs

| Decision | Reasoning | Alternatives Considered |
|----------|-----------|--------------------------|
| **Flask + Gunicorn** | Minimal footprint, easy to containerise, mature ecosystem. | FastAPI (more async support) – rejected due to project scope. |
| **AST‑based evaluation** | Guarantees safety without external sandbox dependencies. | `numexpr` – faster but still allows function calls; not safe enough. |
| **Single‑page static UI** | Simplicity; no need for a SPA framework. | React/Vue – would increase bundle size and build complexity. |
| **Docker multi‑stage** | Keeps final image small (~30 MB). | Single‑stage – larger image, slower pull times. |
| **GitHub Actions** | Integrated with repository, free tier sufficient. | Jenkins/CircleCI – added operational overhead. |

---

## Scalability, Security & Observability

* **Scalability** – Stateless Flask app; horizontal scaling achieved by running multiple containers behind a reverse proxy (e.g., Nginx) or Kubernetes Service.  
* **Rate Limiting** – Not yet implemented; can be added via Flask‑Limiter or API gateway.  
* **Input Sanitisation** – All user‑provided data is JSON‑decoded and validated before processing. No direct HTML rendering of user input, preventing XSS.  
* **Secrets Management** – Sensitive values (e.g., `SECRET_KEY`) are injected via environment variables; `.env.example` provides placeholders only.  
* **Logging** – Structured JSON logs include request ID (generated per request) for traceability.  
* **Health Endpoint** – `GET /health` returns `200 OK` with `{ "status": "healthy" }`.  

---

## Future Enhancements

1. **Authentication** – JWT‑based auth to restrict API usage.  
2. **Extended Operators** – Support for scientific functions (`sin`, `log`) via a safe math‑module whitelist.  
3. **Rate Limiting & Throttling** – Prevent abuse with per‑IP limits.  
4. **Kubernetes Deployment** – Helm chart for production clusters, with autoscaling based on CPU/memory.  
5. **Observability Stack** – Export logs to Loki, metrics to Prometheus, and traces via OpenTelemetry.  

---

## References

- **Flask Documentation** – https://flask.palletsprojects.com/  
- **Python `ast` Module** – https://docs.python.org/3/library/ast.html  
- **Docker Best Practices** – https://docs.docker.com/develop/develop-images/dockerfile_best-practices/  
- **GitHub Actions Workflow Syntax** – https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions  

---  

*End of Architecture Document*