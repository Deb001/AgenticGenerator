# Arithmetic Web Calculator

## Overview
A minimal full‑stack calculator that evaluates basic arithmetic expressions safely on the server and provides a responsive, accessible web UI.

## Stack
- **Backend**: Python 3.11, Flask, Gunicorn
- **Frontend**: HTML5, CSS3 (Grid), vanilla JavaScript (ES6 modules)
- **Containerisation**: Docker & Docker‑Compose
- **Testing**: unittest (unit & integration)

## Setup & Run Locally
```bash
# Clone repo
git clone <repo-url>
cd <repo-dir>

# Backend (virtualenv optional)
python -m venv env
source env/bin/activate
pip install -r backend/requirements.txt
export FLASK_ENV=development
python backend/app.py  # runs on http://127.0.0.1:5000

# Frontend (simple static server)
cd frontend
python -m http.server 8080  # open http://localhost:8080
```

## Docker
```bash
docker compose up --build -d
# API available at http://localhost:5000, frontend can be served via any static host.
```

## Testing
```bash
source env/bin/activate
python -m unittest discover -s tests
```

## Security Notes
- No secrets are hard‑coded; configuration is read from environment variables.
- CORS is restricted to the same origin (or explicit ALLOWED_ORIGINS).
- The evaluator uses Python's `ast` module and only permits safe nodes.
- Debug mode is disabled in production (`FLASK_ENV=production`).

## Accessibility
- All buttons are focusable (`tabindex="0"`).
- ARIA roles (`role="application"`) and labels are provided.
- Keyboard shortcuts mirror the visual keypad.

## License
MIT
