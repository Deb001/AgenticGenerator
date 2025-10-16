# Primitive Calculator – Detailed Requirements
**Document:** `docs/requirements.md`  
**Derived from:** Subtask 1 (Requirement Gathering)  
**Issue Key:** AI-1  

---

## Table of Contents
1. [Purpose & Scope](#purpose--scope)  
2. [Functional Requirements](#functional-requirements)  
   - 2.1 [Supported Operations](#supported-operations)  
   - 2.2 [Input Validation](#input-validation)  
   - 2.3 [JSON API Specification](#json-api-specification)  
   - 2.4 [Error Handling & Responses](#error-handling--responses)  
3. [Non‑Functional Requirements](#non‑functional-requirements)  
   - 3.1 [User Interface](#user-interface)  
   - 3.2 [Performance & Scalability](#performance--scalability)  
   - 3.3 [Security](#security)  
   - 3.4 [Reliability & Availability](#reliability--availability)  
   - 3.5 [Maintainability & Extensibility](#maintainability--extensibility)  
   - 3.6 [Deployment & Operations](#deployment--operations)  
4. [Acceptance Criteria](#acceptance-criteria)  
5. [Assumptions & Constraints](#assumptions--constraints)  
6. [Dependencies](#dependencies)  
7. [Glossary](#glossary)  

---

## Purpose & Scope
The **Primitive Calculator** is a minimal web‑based arithmetic service that allows users to perform basic binary operations (addition, subtraction, multiplication, division) via a responsive UI and a RESTful JSON API.  
This document captures **all functional and non‑functional requirements** that the implementation must satisfy to be considered complete and production‑ready.

---

## Functional Requirements

### 2.1 Supported Operations
| Operation | Symbol | Description |
|-----------|--------|-------------|
| **Add**   | `+`    | Returns the sum of two numeric operands. |
| **Subtract** | `-` | Returns the difference (`operand1 - operand2`). |
| **Multiply** | `*` | Returns the product of the operands. |
| **Divide** | `/` | Returns the quotient (`operand1 / operand2`). Must handle division‑by‑zero gracefully. |

*Only the four operations above are supported. Any request specifying an unsupported operation must be rejected with a clear error message.*

### 2.2 Input Validation
1. **Payload Structure** – The API must accept a JSON object with the following keys:  
      {
     "operand1": <number>,
     "operand2": <number>,
     "operation": "<add|subtract|multiply|divide>"
   }
   2. **Data Types** – `operand1` and `operand2` must be valid JSON numbers (integer or floating‑point). Strings that can be parsed as numbers are **not** accepted.
3. **Range Checks** – No explicit upper/lower bounds, but values must be representable by Python’s `float`. Extremely large values that cause overflow should be caught and reported.
4. **Operation Enum** – The `operation` field must be one of the exact strings: `add`, `subtract`, `multiply`, `divide`. Case‑sensitive.
5. **Missing/Extra Fields** – Missing required fields or presence of unexpected fields results in a `400 Bad Request` with a descriptive error.

### 2.3 JSON API Specification
- **Endpoint:** `POST /api/calculate`
- **Content‑Type:** `application/json`
- **Success Response (`200 OK`):**
    {
    "result": <number>
  }
  - **Error Responses:**
  - `400 Bad Request` – Invalid payload, missing fields, unsupported operation, non‑numeric operands, division by zero, etc.
  - `415 Unsupported Media Type` – Request not sent as `application/json`.
  - `500 Internal Server Error` – Unexpected server‑side failures (should be logged with stack trace).

### 2.4 Error Handling & Responses
| Condition | HTTP Status | JSON Body Example |
|-----------|-------------|-------------------|
| Invalid JSON syntax | 400 | `{ "error": "Malformed JSON payload." }` |
| Missing required field | 400 | `{ "error": "Field 'operand1' is required." }` |
| Operand not a number | 400 | `{ "error": "Field 'operand2' must be a numeric value." }` |
| Unsupported operation | 400 | `{ "error": "Operation 'mod' is not supported." }` |
| Division by zero | 400 | `{ "error": "Division by zero is not allowed." }` |
| Wrong Content‑Type | 415 | `{ "error": "Content-Type must be application/json." }` |
| Unexpected server error | 500 | `{ "error": "An unexpected error occurred. Please try again later." }` |

All error responses must include a **human‑readable** `error` field and **must not** expose internal stack traces or implementation details.

---

## Non‑Functional Requirements

### 3.1 User Interface
- **Responsive Design** – UI must adapt to mobile, tablet, and desktop viewports (minimum breakpoints: 320 px, 768 px, 1024 px).
- **Accessibility** – Follow WCAG 2.1 AA guidelines: proper form labels, focus order, ARIA attributes where needed.
- **Client‑Side Validation** – Prevent submission of empty fields or non‑numeric input before contacting the API.
- **Graceful Degradation** – If JavaScript is disabled, the form should still submit via a standard POST (fallback route not required for MVP but must not break).

### 3.2 Performance & Scalability
- **Response Time** – API must respond within **200 ms** for typical inputs under normal load.
- **Throughput** – System should handle at least **100 concurrent requests** without degradation (tested in staging).
- **Statelessness** – Each request is independent; no server‑side session state is required.

### 3.3 Security
- **Input Sanitization** – All incoming data must be validated; no raw evaluation of expressions.
- **HTTPS Enforcement** – In production, the service must be served behind TLS termination (e.g., via a reverse proxy). The Docker image must expose only HTTP; TLS is out of scope for the code base but documented.
- **Environment Secrets** – Flask secret key and any configurable values must be read from environment variables (`.env` file). No secrets are hard‑coded.
- **Rate Limiting** – Not required for MVP, but the architecture should allow easy integration of a rate‑limiting middleware.

### 3.4 Reliability & Availability
- **Containerization** – Application must run inside a Docker container defined by `Dockerfile`. The container must start cleanly and exit with status 0 on success.
- **Health Checks** – The container should expose a simple `/health` endpoint returning `200 OK` with `{ "status": "healthy" }`.
- **Logging** – All requests and errors must be logged to `stdout` in JSON format for easy aggregation (e.g., via Docker logging drivers).

### 3.5 Maintainability & Extensibility
- **Modular Codebase** – Core arithmetic logic resides in `src/calculator.py`; API routing in `src/routes.py`; Flask app factory in `src/app.py`.
- **Test Coverage** – Minimum **90 %** unit test coverage for calculator functions and **80 %** integration coverage for API endpoints.
- **Documentation** – Inline docstrings, type hints, and this requirements document must stay in sync with the code.

### 3.6 Deployment & Operations
- **Docker Compose** – `docker-compose.yml` must orchestrate the Flask service (and optional reverse proxy) for local development and staging.
- **Configuration via Environment** – Port, Flask debug flag, and secret key are configurable through environment variables.
- **CI/CD Compatibility** – Repository must include a GitHub Actions workflow (not part of this file) that builds the Docker image, runs tests, and pushes to a registry.

---

## Acceptance Criteria
The implementation will be considered **complete** when **all** of the following are verified:

1. **Functional Tests**
   - All four arithmetic operations return correct results for positive, negative, integer, and floating‑point inputs.
   - Division by zero returns a `400` error with the prescribed JSON body.
   - Invalid JSON, missing fields, unsupported operations, and wrong `Content-Type` produce appropriate error responses.

2. **API Contract**
   - The `/api/calculate` endpoint adheres to the request/response schema described in §2.3.
   - The `/health` endpoint returns `{ "status": "healthy" }` with HTTP 200.

3. **UI Behaviour**
   - The web page loads correctly on desktop, tablet, and mobile viewports.
   - Client‑side validation prevents submission of non‑numeric values.
   - Successful calculations display the result without a full page reload.

4. **Non‑Functional Checks**
   - Docker container builds without errors and starts in detached mode.
   - Logs are emitted in JSON format and include request method, path, status code, and timestamp.
   - Application runs under Flask’s production configuration (debug disabled) when `FLASK_ENV=production`.

5. **Testing & Coverage**
   - Unit test suite (`tests/unit/test_calculator.py`) passes with ≥ 90 % coverage.
   - Integration test suite (`tests/integration/test_api.py`) passes with ≥ 80 % coverage.
   - CI pipeline (if present) reports successful build, test, and lint stages.

6. **Documentation**
   - This `requirements.md` file accurately reflects the implemented behaviour.
   - README contains setup, build, and run instructions consistent with the code.

---

## Assumptions & Constraints
- The calculator only needs to handle **binary** operations (exactly two operands). No expression parsing or chaining.
- No persistence layer is required; the service is stateless.
- Internationalization (i18n) is out of scope for the MVP.
- The service will be deployed behind a reverse proxy that terminates TLS; the container itself only serves HTTP.

---

## Dependencies
| Component | Version (as of this document) | Reason |
|-----------|------------------------------|--------|
| Python | `3.11` | Modern language features, type hints |
| Flask | `2.3` | Lightweight web framework |
| Gunicorn | `22.0` | Production WSGI server (used in Docker) |
| pytest | `8.2` | Test runner |
| pytest‑flask | `1.3` | Flask integration testing |
| Docker | `>=20.10` | Container runtime |

All dependencies are listed in `requirements.txt`.

---

## Glossary
- **MVP** – Minimum Viable Product.
- **WCAG** – Web Content Accessibility Guidelines.
- **JSON** – JavaScript Object Notation, a lightweight data‑interchange format.
- **Stateless** – No server‑side session data is retained between requests.
- **CI/CD** – Continuous Integration / Continuous Deployment pipelines.

--- 

*Document last updated: 2025‑10‑16*