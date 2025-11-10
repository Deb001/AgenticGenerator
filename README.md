# SecureTodoAPI
A minimal, production‑ready Flask REST API for managing personal to‑do items with JWT authentication and strong security defaults.

## Features
- User registration & login (bcrypt‑hashed passwords)
- Stateless JWT access tokens (1‑hour expiry)
- CRUD endpoints for to‑do items, scoped per user
- Input validation via Pydantic
- Secure HTTP headers (via Flask‑Talisman)
- CORS limited to API routes
- Docker‑compose for local development

## Quick Start (Docker)
```bash
git clone <repo-url>
cd SecureTodoAPI
cp .env.example .env   # edit secrets
docker compose up --build -d
```
The API will be reachable at `http://localhost:5000/api/`.

## API Reference
### Auth
- `POST /api/auth/register`
  ```json
  {"email": "user@example.com", "password": "StrongPass123"}
  ```
- `POST /api/auth/login`
  ```json
  {"email": "user@example.com", "password": "StrongPass123"}
  ```
  Returns `{ "access_token": "..." }`.

### Todos (JWT required)
- `GET /api/todos/` – list all user todos
- `POST /api/todos/` – create
- `GET /api/todos/<id>` – retrieve
- `PUT /api/todos/<id>` – update
- `DELETE /api/todos/<id>` – delete
All requests must include header:
`Authorization: Bearer <access_token>`

## Development
### Prerequisites
- Python 3.11+
- PostgreSQL (or use SQLite for quick tests)
### Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
export FLASK_ENV=development
flask run
```
### Running Tests
```bash
pytest -v
```

## Security Considerations
- **Secrets**: Never commit real secrets. Use environment variables.
- **HTTPS**: In production, terminate TLS at a reverse proxy (nginx, Traefik).
- **Rate Limiting**: Add Flask‑Limiter or similar before exposing to the internet.
- **CSP**: Adjust `Flask-Talisman` CSP settings as needed.

## License
MIT