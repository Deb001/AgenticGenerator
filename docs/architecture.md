# System Architecture Overview

This document provides a detailed description of the architecture for the **Flask‑based Calculator** application. It covers the **Model‑View‑Controller (MVC)** separation, the **request flow** from the user interface to the API, the **tokenization algorithm** used for parsing arithmetic expressions, and the **deployment topology** for production environments.

---

## 1. MVC Separation

| Layer | Responsibility | Primary Files | Key Concepts |
|-------|----------------|---------------|--------------|
| **Model** | Encapsulates business logic and data manipulation. | `app/calculator.py` | Pure Python functions (`add`, `subtract`, `multiply`, `divide`) that raise domain‑specific exceptions for invalid operations (e.g., division by zero). |
| **View** | Renders the user interface and presents data to the user. | `templates/index.html`, `static/css/style.css`, `static/js/app.js` | Jinja2 template renders the calculator UI; client‑side JavaScript sends AJAX requests and updates the DOM with results. |
| **Controller** | Orchestrates request handling, input validation, and response formatting. | `app/routes.py` | Flask view functions (`/`, `/api/calculate`) that validate JSON payloads, invoke model functions, and return JSON responses with appropriate HTTP status codes. |

The **Flask application factory** in `app/__init__.py` wires the components together:

def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object('app.config.Config')
    app.register_blueprint(routes.bp)
    return app

This keeps the framework configuration separate from business logic, enabling unit testing of the model and controller in isolation.

---

## 2. Request Flow (UI → API → Model → Response)

sequenceDiagram
    participant UI as Browser (HTML/JS)
    participant API as Flask /api/calculate
    participant Ctrl as routes.calculate()
    participant Model as calculator.calculate()
    UI->>API: POST /api/calculate { "expression": "3+5*2" }
    API->>Ctrl: Validate payload & auth token
    Ctrl->>Model: calculate("3+5*2")
    Model->>Model: tokenize → parse → evaluate
    Model-->>Ctrl: result (or error)
    Ctrl-->>API: JSON { "result": 13 } / 400 on error
    API-->>UI: JSON response

1. **User Interaction** – The user enters an arithmetic expression in the UI and clicks *Calculate*.
2. **AJAX Request** – `static/js/app.js` sends a `POST` request to `/api/calculate` with a JSON body.
3. **Controller Validation** – The Flask route validates:
   - Content‑type (`application/json`).
   - Presence of the `expression` field.
   - Optional JWT token in the `Authorization` header (future‑proof for auth).
4. **Model Invocation** – The controller forwards the expression to `calculator.calculate()`.
5. **Tokenization & Evaluation** – The model tokenizes the string, builds an abstract syntax tree (AST), and evaluates it.
6. **Response Generation** – The controller returns a JSON payload with the numeric result or a structured error object (`error_code`, `message`).

All errors are logged (see **Logging** section) and translated into HTTP 4xx/5xx responses with a consistent schema:

{
  "error": {
    "code": "INVALID_EXPRESSION",
    "message": "Unexpected token at position 4."
  }
}

---

## 3. Tokenization Algorithm

The calculator supports the following grammar:

expression   ::= term ((‘+’ | ‘-’) term)*
term         ::= factor ((‘*’ | ‘/’) factor)*
factor       ::= NUMBER | '(' expression ')'
NUMBER       ::= DIGIT+ ('.' DIGIT+)?

### 3.1 Token Types

| Token | Regex | Description |
|-------|-------|-------------|
| `NUMBER` | `\d+(\.\d+)?` | Integer or floating‑point literal |
| `PLUS`   | `\+` | Addition operator |
| `MINUS`  | `-` | Subtraction operator |
| `MULT`   | `\*` | Multiplication operator |
| `DIV`    | `/` | Division operator |
| `LPAREN` | `\(` | Left parenthesis |
| `RPAREN` | `\)` | Right parenthesis |
| `WHITESPACE` | `\s+` | Ignored during tokenization |

### 3.2 Implementation Highlights

* **Deterministic Finite Automaton (DFA)** – The tokenizer iterates over the input string once, matching the longest possible token at each position.  
* **Error Reporting** – When an unknown character is encountered, the tokenizer raises `TokenizationError` with the offending character and its index, enabling precise UI feedback.  
* **Immutable Token Objects** – Tokens are represented by a `namedtuple` (`Token(type, value, position)`) to guarantee thread‑safety and avoid accidental mutation.

Token = namedtuple('Token', ['type', 'value', 'position'])

### 3.3 Example

Input: `"12.5 * (3 - 7) / 2"`

Token stream:

[NUMBER(12.5,0), MULT(*,5), LPAREN((,7), NUMBER(3,8), MINUS(-,10),
 NUMBER(7,12), RPAREN()), DIV(/,14), NUMBER(2,16)]

The parser consumes this stream using a **recursive‑descent** approach that respects operator precedence and associativity, constructing an AST that the evaluator walks to produce the final result.

---

## 4. Deployment Topology

The application is containerized using Docker and orchestrated with Docker‑Compose. The topology is deliberately simple for a single‑service micro‑application but includes best‑practice patterns for scalability and observability.

┌─────────────────────┐
│   Client Browser    │
│ (HTML/JS over HTTPS)│
└───────▲───────▲─────┘
        │       │
        │       │
   HTTP │   WebSocket (future)
        │       │
┌───────▼───────▼─────┐
│   Nginx Reverse    │
│   Proxy (TLS Term)│
└───────▲───────▲─────┘
        │       │
        │       │
┌───────▼───────▼─────┐
│   Flask Container  │
│  (Gunicorn workers)│
└───────▲───────▲─────┘
        │       │
        │       │
   Logs│   Metrics│
        │       │
┌───────▼───────▼─────┐
│   Centralized Log   │
│   Aggregator (ELK) │
└─────────────────────┘

### 4.1 Components

| Component | Role | Configuration Highlights |
|-----------|------|--------------------------|
| **Nginx** (optional) | TLS termination, HTTP/2, static asset caching | `docker-compose.yml` can mount a custom `nginx.conf`. |
| **Flask (Gunicorn)** | Application server with multiple worker processes (`--workers 3`). | `Dockerfile` builds a slim Python image; `ENTRYPOINT` runs `gunicorn -b 0.0.0.0:5000 app:app`. |
| **Docker Compose** | Orchestrates the Flask container, binds port `5000`, injects `.env` variables. | `restart: unless-stopped`, `depends_on` ensures proper startup order. |
| **Logging** | Structured JSON logs emitted via Python `logging` module. | Logs are sent to `stdout` and captured by Docker; can be forwarded to ELK/Prometheus. |
| **Healthchecks** | Liveness and readiness probes using `/health` endpoint (future extension). | Defined in `docker-compose.yml` with `healthcheck` block. |

### 4.2 Scaling Strategy

* **Horizontal Scaling** – Increase the number of Flask containers behind an external load balancer (e.g., AWS ALB, Nginx upstream). The stateless nature of the calculator ensures perfect scalability.
* **Worker Autoscaling** – Adjust Gunicorn worker count based on CPU/memory limits defined in the container runtime.
* **Zero‑Downtime Deployments** – Use Docker rolling updates (`docker service update --rollback`) or Kubernetes Deployments for blue‑green releases.

---

## 5. Logging & Observability

The application uses the standard library `logging` module, configured in `app/__init__.py`:

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[logging.StreamHandler()]
)

* **DEBUG** – Tokenization and parsing steps (enabled only in development via `FLASK_ENV=development`).  
* **INFO** – Successful request processing, including request ID and user IP.  
* **WARNING** – Recoverable issues such as malformed but parsable expressions.  
* **ERROR** – Exceptions raised during calculation (e.g., division by zero).  
* **CRITICAL** – Unexpected failures that cause the worker to terminate.

All logs are emitted as **JSON** when `LOG_FORMAT=json` environment variable is set, facilitating ingestion by log aggregation pipelines.

---

## 6. Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Input Validation** | Strict tokenization prevents code injection; only numeric literals and arithmetic operators are accepted. |
| **Cross‑Site Scripting (XSS)** | UI sanitizes user‑generated content; server never reflects raw input in HTML responses. |
| **Transport Security** | Recommended deployment behind TLS‑terminating reverse proxy (HTTPS). |
| **Authentication** | Blueprint ready for JWT validation (`Authorization: Bearer <token>`). |
| **Secret Management** | No secrets are hard‑coded; configuration values (e.g., `SECRET_KEY`) are loaded from environment variables or `config/default.yaml`. |

---

## 7. Extensibility Roadmap

| Feature | Impact on Architecture |
|---------|------------------------|
| **Scientific Functions** (sin, cos, log) | Extend the tokenizer with new token types and update the parser/evaluator accordingly. |
| **Expression History** | Add a persistence layer (e.g., PostgreSQL) and introduce a Repository pattern in the Model. |
| **User Authentication** | Implement JWT verification in the controller; protect routes with a Flask `@login_required` decorator. |
| **WebSocket API** | Introduce a separate Blueprint for real‑time calculation streams; keep existing HTTP API unchanged. |

---

## 8. References

* **Flask Application Factory Pattern** – https://flask.palletsprojects.com/en/latest/patterns/appfactories/
* **Gunicorn Worker Types** – https://docs.gunicorn.org/en/latest/design.html#worker-types
* **Docker Best Practices** – https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
* **Mermaid Diagram Syntax** – https://mermaid.js.org/

--- 

*Document version:* **1.0** – generated on **2025‑10‑16**. Updates should be reflected in the project’s `CHANGELOG.md`.