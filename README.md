# Flask Calculator API

A lightweight web application that provides a safe arithmetic expression evaluator via a Flask REST API and a responsive web UI. The project demonstrates clean architecture, Docker‑based deployment, and comprehensive testing.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Locally (development server)](#locally-development-server)
  - [Docker Compose (production‑like)](#docker-compose-production-like)
- [API Usage](#api-usage)
- [Web UI](#web-ui)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Features

- **Safe expression evaluation** – parses and evaluates arithmetic expressions without using `eval`.
- **RESTful API** – `POST /api/evaluate` returns JSON with the result or error details.
- **Responsive UI** – a single‑page calculator built with HTML, CSS, and vanilla JavaScript.
- **Docker ready** – multi‑stage Dockerfile and `docker‑compose.yml` for easy deployment.
- **Configuration via environment variables** – managed by `python-dotenv`.
- **Full test suite** – pytest tests covering normal and edge cases.

## Prerequisites

- Python **3.9+**
- [pip](https://pip.pypa.io/en/stable/installation/)
- (Optional) Docker & Docker Compose for containerised execution

## Installation

1. Clone the repository  

      git clone https://github.com/yourusername/flask-calculator.git
   cd flask-calculator
   
2. Create a virtual environment and activate it  

      python -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate
   
3. Install Python dependencies  

      pip install -r requirements.txt
   
4. Set up environment variables  

      cp .env.example .env
   # Edit .env if you need custom values (e.g., FLASK_ENV, SECRET_KEY)
   
## Running the Application

### Locally (development server)

flask --app app run --debug

The API will be available at `http://127.0.0.1:5000/api/evaluate` and the UI at `http://127.0.0.1:5000/`.

### Docker Compose (production‑like)

docker compose up --build

The service will be reachable at `http://localhost:8000/` (Gunicorn behind Nginx if configured).

## API Usage

**Endpoint**

POST /api/evaluate
Content-Type: application/json

**Request Body**

{
  "expression": "2 * (3 + 4) / 5"
}

**Successful Response**

{
  "result": 2.8,
  "error": null
}

**Error Response**

{
  "result": null,
  "error": "Invalid characters in expression."
}

You can test the endpoint with `curl`:

curl -X POST http://127.0.0.1:5000/api/evaluate \
     -H "Content-Type: application/json" \
     -d '{"expression": "10 / (2 + 3)"}'

## Web UI

Open `http://127.0.0.1:5000/` in a browser. The page provides:

- An input field for arithmetic expressions.
- A “Calculate” button that sends the expression to the API via AJAX.
- Real‑time display of the result or error message.

The UI is fully responsive and works on mobile devices.

## Testing

Run the test suite with pytest:

pytest -v

All tests are located in the `tests/` directory and cover:

- Correct evaluation of valid expressions.
- Proper handling of division by zero, malformed input, and disallowed characters.
- Edge cases such as large numbers and floating‑point precision.

## Contribution Guidelines

1. **Fork the repository** and create a new branch for your feature or bug fix.  
2. **Write tests** for any new functionality or bug fix.  
3. **Follow PEP 8** (Python) and the existing code style.  
4. **Update documentation** (README, docstrings) as needed.  
5. Submit a **pull request** with a clear description of your changes.

Please ensure that all tests pass before opening a PR.

## License

This project is licensed under the MIT License – see the `LICENSE` file for details.