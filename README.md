# SecureTodoAPI
A minimal, secure, production‑ready REST API for managing personal to‑do items.
## Features
- JWT‑based stateless authentication
- Password hashing with bcrypt (Werkzeug)
- Input validation via Marshmallow
- PostgreSQL persistence (Dockerized)
- Full test suite with pytest
## Quick Start (Docker)
```bash
# Clone the repository
git clone <repo-url>
cd SecureTodoAPI
# Copy example env and set secrets
cp .env.example .env
# Edit .env and replace SECRET_KEY and JWT_SECRET with strong random strings
# Build and run containers
docker-compose up --build -d
# Apply database migrations (optional – for MVP tables are created on first request)
docker exec -it secure_todo_api flask db upgrade
```
The API will be reachable at `http://localhost:5000/`.
## API Documentation
### Authentication
- **POST /auth/register**
  ```json
  {"username": "johndoe", "email": "john@example.com", "password": "StrongPass!"}
  ```
  Returns `201 Created` on success.
- **POST /auth/login**
  ```json
  {"username": "johndoe", "password": "StrongPass!"}
  ```
  Returns `{ "token": "<jwt>" }`.
### To‑Do Endpoints (Bearer token required)
- **GET /todos** – list user's todos.
- **POST /todos** – create new todo.
- **GET /todos/<id>** – retrieve specific todo.
- **PUT /todos/<id>** – update fields.
- **DELETE /todos/<id>** – delete todo.
All request/response bodies are JSON. Use header `Authorization: Bearer <token>`.
## Running Tests
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install pytest
pytest
```
## Security Considerations
- Secrets are never stored in code; they must be provided via environment variables.
- Debug mode is disabled in production.
- JWTs have a short lifetime (15 min).
- All inputs are validated; no raw SQL is used.
- CORS is not enabled by default; add Flask‑CORS if needed.
## License
MIT