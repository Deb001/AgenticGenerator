# Flask Calculator API

A lightweight web application that provides a RESTful API for evaluating arithmetic expressions. The backend is built with Flask and Gunicorn, while the frontend offers a simple calculator UI built with HTML, CSS, and JavaScript.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Locally with Python](#locally-with-python)
  - [Using Docker](#using-docker)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Features

- **Stateless calculation endpoint** – POST `/api/calculate` with a JSON payload containing an arithmetic expression.
- **Input validation & safe evaluation** – Prevents code injection and handles malformed expressions gracefully.
- **Dockerized deployment** – Multi‑stage Docker build with Gunicorn for production.
- **Responsive UI** – Simple calculator UI that works on desktop and mobile browsers.
- **Comprehensive test suite** – Unit tests covering valid calculations, division by zero, and malformed inputs.

## Architecture

root
├── src
│   ├── app.py          # Flask application factory
│   ├── routes.py       # API endpoint implementation
│   ├── templates
│   │   └── index.html  # Front‑end UI
│   └── static
│       ├── css
│       │   └── style.css
│       └── js
│           └── app.js
├── tests
│   ├── __init__.py
│   └── test_app.py     # Test suite for the API
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md

The Flask app is created in `src/app.py`, registers the routes from `src/routes.py`, and serves static assets. The calculation logic validates the expression, evaluates it safely using Python's `ast` module, and returns a JSON response.

## Prerequisites

- **Python 3.9+**
- **Docker** (optional, for containerized execution)
- **Git** (to clone the repository)

## Installation

# Clone the repository
git clone https://github.com/yourusername/flask-calculator-api.git
cd flask-calculator-api

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate   # On Windows use `.venv\Scripts\activate`

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template and edit as needed
cp .env.example .env

## Running the Application

### Locally with Python

# Ensure the virtual environment is active
source .venv/bin/activate

# Export Flask configuration (optional)
export FLASK_ENV=development
export FLASK_APP=src/app.py

# Run the development server
flask run --host 0.0.0.0 --port 5000

Visit `http://localhost:5000` to view the calculator UI or send API requests to `http://localhost:5000/api/calculate`.

### Using Docker

# Build and start the containers
docker compose up --build -d

# The API will be reachable at http://localhost:8000
# (Gunicorn is bound to port 8000 inside the container)

To stop and remove containers:

docker compose down

## API Reference

### POST `/api/calculate`

Evaluates a single arithmetic expression.

**Request**

{
  "expression": "12 / (2 + 4) * 3"
}

- `expression` (string, required): A mathematical expression consisting of numbers, parentheses, and the operators `+`, `-`, `*`, `/`.

**Response (200 OK)**

{
  "result": 6.0,
  "expression": "12 / (2 + 4) * 3"
}

**Error Responses**

- `400 Bad Request` – Invalid JSON, missing `expression`, or malformed expression.
- `422 Unprocessable Entity` – Division by zero or other evaluation errors.

**Example with `curl`**

curl -X POST http://localhost:5000/api/calculate \
     -H "Content-Type: application/json" \
     -d '{"expression": "7 * (3 + 2)"}'

## Testing

The project uses `pytest` for unit testing.

# Install test dependencies (already in requirements.txt)
pip install -r requirements.txt

# Run the test suite
pytest -v

All tests should pass:

============================= test session starts ==============================
collected 5 items

tests/test_app.py .....                                                [100%]

============================== 5 passed in 0.42s ===============================

## Contribution Guidelines

1. **Fork the repository** and create a feature branch.
2. **Write tests** for any new functionality.
3. **Follow PEP 8** (Python) and the project's linting rules.
4. **Document** public functions and modules with docstrings.
5. **Submit a pull request** with a clear description of changes.

Please ensure that CI passes and that your code does not introduce new warnings.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.