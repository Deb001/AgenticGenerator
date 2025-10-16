# Architecture Overview {#AI-1}

This document provides a high‑level view of the **Primitive Calculator** system, describing how the client, server, and supporting modules interact. It is referenced from the project's `README.md` for developers who need to understand the internal design, deployment model, and data flow.

---

## Table of Contents

1. [System Context](#system-context)  
2. [Component Diagram](#component-diagram)  
3. [Module Responsibilities](#module-responsibilities)  
4. [Client‑Server Interaction Flow](#client-server-interaction-flow)  
5. [Request / Response Lifecycle](#request--response-lifecycle)  
6. [Error Handling & Logging](#error-handling--logging)  
7. [Deployment & Runtime Environment](#deployment--runtime-environment)  
8. [Extensibility & Future Enhancements](#extensibility--future-enhancements)  

---

## System Context <a name="system-context"></a>

+-------------------+          HTTP          +-------------------+
|   Web Browser    |  <--------------------> |   Flask Service   |
| (HTML/JS UI)      |   REST API (JSON)      | (src/app.py)      |
+-------------------+                        +-------------------+

* **Client** – Static assets (`index.html`, `style.css`, `app.js`) served by Flask.  
* **Server** – A Flask application exposing a single JSON API endpoint (`/api/calculate`).  
* **Calculator Core** – Pure‑Python arithmetic functions (`add`, `subtract`, `multiply`, `divide`) located in `src/calculator.py`.  

All communication is stateless and uses JSON payloads over HTTP.

---

## Component Diagram <a name="component-diagram"></a>

┌─────────────────────────────────────────────────────────────┐
│                         Docker Container                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                     Flask Application                  │ │
│  │  ┌─────────────┐   ┌───────────────┐   ┌───────────────┐ │ │
│  │  │ app.py      │   │ routes.py    │   │ calculator.py│ │ │
│  │  │ (create app│   │ (API layer)   │   │ (business    │ │ │
│  │  │  & config) │   │               │   │  logic)      │ │ │
│  │  └─────┬───────┘   └───────┬───────┘   └───────┬───────┘ │ │
│  │        │                 │                 │         │ │
│  │        ▼                 ▼                 ▼         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │   HTTP Request (JSON) → Validation → Execution │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                     ▲                                 │ │
│  │                     │                                 │ │
│  │   JSON Response ← Result ← Formatting ← Error Handling│ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

*The diagram is intentionally simple to keep the documentation lightweight while still conveying the essential flow.*

---

## Module Responsibilities <a name="module-responsibilities"></a>

| Module | Path | Primary Responsibility |
|--------|------|------------------------|
| **`app.py`** | `src/app.py` | Create the Flask app, load configuration (`.env`), register blueprints, and start the WSGI server. |
| **`routes.py`** | `src/routes.py` | Define the `/api/calculate` endpoint, perform request validation, invoke calculator functions, and return a JSON response. |
| **`calculator.py`** | `src/calculator.py` | Pure‑Python arithmetic utilities (`add`, `subtract`, `multiply`, `divide`). No Flask or I/O dependencies – fully unit‑testable. |
| **Static Assets** | `src/static/*` | UI styling (`style.css`) and client‑side logic (`app.js`). |
| **Templates** | `src/templates/index.html` | Server‑side rendered HTML entry point for the SPA‑like UI. |
| **Tests** | `tests/unit/*`, `tests/integration/*` | Unit tests for core logic and integration tests for the API endpoint. |
| **Dockerfile / docker‑compose.yml** | Root | Containerisation and orchestration for local development and production staging. |

---

## Client‑Server Interaction Flow <a name="client-server-interaction-flow"></a>

1. **Page Load** – Browser requests `/` → Flask serves `index.html` plus static assets.  
2. **User Input** – The UI collects two numbers and an operation (`add`, `sub`, `mul`, `div`).  
3. **Form Submission** – `app.js` serialises the data to JSON and sends a `POST` request to `/api/calculate`.  
4. **Server Validation** – `routes.py` validates the JSON schema (presence, numeric types, supported operation).  
5. **Business Logic Execution** – The appropriate function from `calculator.py` is called.  
6. **Result Packaging** – The numeric result (or an error message) is wrapped in a JSON envelope and returned with an HTTP status code.  
7. **UI Update** – `app.js` parses the response and updates the DOM with the result or displays an error toast.

All steps are synchronous from the user’s perspective but the server processes each request in an isolated Flask request context, ensuring thread‑safety.

---

## Request / Response Lifecycle <a name="request--response-lifecycle"></a>

### Request Payload (JSON)

{
  "operand1": 12.5,
  "operand2": 3,
  "operation": "divide"
}

* `operand1` – First numeric operand (float or int).  
* `operand2` – Second numeric operand (float or int).  
* `operation` – One of `"add"`, `"subtract"`, `"multiply"`, `"divide"`.

### Successful Response (HTTP 200)

{
  "status": "success",
  "result": 4.1666666667
}

### Error Response (HTTP 400/422)

{
  "status": "error",
  "error": "Division by zero is not allowed."
}

* Validation errors (missing fields, unsupported operation) return **400 Bad Request**.  
* Runtime errors (e.g., division by zero) return **422 Unprocessable Entity**.

The response schema is deliberately minimal to keep the API consumable by any client (browser, curl, automated tests).

---

## Error Handling & Logging <a name="error-handling--logging"></a>

* **Input Validation** – Implemented in `routes.py` using explicit checks; malformed payloads raise `BadRequest`.  
* **Business Exceptions** – `calculator.divide` raises a custom `ZeroDivisionError` which is caught and transformed into a 422 response.  
* **Global Error Handler** – `app.py` registers a Flask errorhandler that logs the exception stack trace (via the standard `logging` module) and returns a JSON error payload.  
* **Logging** – All requests and responses are logged at `INFO` level; unexpected exceptions are logged at `ERROR` level with full traceback. The logger is configured via environment variables (`LOG_LEVEL`, `LOG_FORMAT`) for flexibility across environments.

---

## Deployment & Runtime Environment <a name="deployment--runtime-environment"></a>

| Aspect | Details |
|--------|---------|
| **Containerisation** | `Dockerfile` builds a lightweight `python:3.11-slim` image, installs dependencies from `requirements.txt`, copies the `src/` tree, and sets `FLASK_APP=src/app.py`. |
| **Orchestration** | `docker-compose.yml` defines a single service `calculator` exposing port `5000` (configurable via `.env`). |
| **Configuration** | Environment variables (`FLASK_ENV`, `SECRET_KEY`, `LOG_LEVEL`) are loaded from `.env` (example provided in `.env.example`). |
| **Scalability** | Because the API is stateless, horizontal scaling can be achieved by running multiple container instances behind a reverse proxy (e.g., Nginx) – the architecture is designed with this in mind. |
| **Health Checks** | The container includes a simple `/health` endpoint (implemented in `app.py`) returning `{"status":"ok"}` for orchestration health monitoring. |

---

## Extensibility & Future Enhancements <a name="extensibility--future-enhancements"></a>

* **Additional Operations** – Add new functions to `calculator.py` and extend the validation map in `routes.py`.  
* **Authentication** – Introduce Flask‑Login or JWT middleware without affecting the core calculator logic.  
* **Rate Limiting** – Plug in Flask‑Limiter to protect the API from abuse.  
* **OpenAPI Specification** – Generate a Swagger/OpenAPI spec from the route definitions for better client integration.  
* **CI/CD Integration** – Use GitHub Actions to run unit and integration tests, build the Docker image, and push to a registry.

---

*Document version:* 1.0 – **2025‑10‑16**  
*Author:* AI‑Generated (Task **AI‑1**)  

--- 

*For a quick start guide, see the project's main `README.md`.*