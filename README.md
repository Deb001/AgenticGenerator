# Arithmetic Web Calculator

## Overview
A minimal full‑stack calculator that evaluates basic arithmetic expressions via a Flask REST API and a responsive, accessible vanilla JavaScript UI.

## Features
- Safe expression evaluation (no `eval`).
- Clear error messages for malformed input.
- Keyboard, mouse, and touch interaction.
- ARIA‑compliant accessibility (screen‑reader friendly).
- Simple Docker‑compatible deployment.

## Project Structure
```
root/
├─ backend/
│  ├─ app.py                # Flask entry point
│  ├─ evaluator.py          # Expression parser/evaluator
│  └─ subtask_generator.py  # Utility for subtask JSON generation
├─ frontend/
│  ├─ index.html            # UI markup
│  ├─ styles.css            # Styling
│  └─ app.js                # UI logic & API client
├─ requirements.txt         # Python dependencies
├─ .env.example             # Environment variable template
└─ README.md                # This file
```

## Setup & Run (Local)
1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd <repo-dir>
   ```
2. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment**
   ```bash
   cp .env.example .env
   # edit .env if needed
   ```
5. **Run the server**
   ```bash
   flask --app backend/app.py run --host=0.0.0.0 --port=5000
   ```
6. Open a browser to `http://localhost:5000` to use the calculator.

## API Specification
- **POST** `/evaluate`
  - Request JSON: `{ "expression": "2*(3+4)" }`
  - Success response: `{ "result": 14 }`
  - Error response (400): `{ "error": "Division by zero" }`

## Testing
The evaluator can be unit‑tested with `python -m unittest discover backend/tests` (tests not included in MVP).

## Security Considerations
- No secrets are hard‑coded; use environment variables.
- Flask runs with `debug=False` in production.
- Content Security Policy meta tag restricts script sources.
- All inputs are validated server‑side before evaluation.

## License
MIT