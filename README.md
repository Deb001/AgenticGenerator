# Flask Calculator API

A lightweight web application that provides a simple calculator UI and a JSON‑based API for basic arithmetic operations (add, subtract, multiply, divide). The project demonstrates clean architecture, unit/integration testing, Docker containerization, and best practices for a production‑ready Flask service.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Support](#docker-support)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **RESTful API** (`/api/calculate`) accepting JSON payloads.
- **Web UI** (`/`) built with Jinja2, vanilla JavaScript, and responsive CSS.
- Input validation and comprehensive error handling.
- Unit tests for core arithmetic logic and integration tests for Flask routes.
- Docker multi‑stage build for minimal production images.
- Environment‑based configuration with sensible defaults.

## Prerequisites

| Tool | Minimum Version | Installation |
|------|-----------------|--------------|
| Python | 3.9 | `brew install python@3.9` (macOS) or `apt-get install python3.9` (Linux) |
| pip | 21.0+ | Comes with Python; upgrade via `python -m pip install --upgrade pip` |
| Docker | 20.10+ | <https://docs.docker.com/get-docker/> |
| Docker Compose | 2.0+ | Included with Docker Desktop or `pip install docker-compose` |

## Installation

1. **Clone the repository**

      git clone https://github.com/yourusername/flask-calculator.git
   cd flask-calculator
   
2. **Create a virtual environment**

      python -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate
   
3. **Install Python dependencies**

      pip install -r requirements.txt
   
4. **Set up environment variables**

   Copy the example file and edit as needed:

      cp .env.example .env
   
   The default `.env.example` contains:

      FLASK_ENV=development
   SECRET_KEY=super-secret-key
   
## Configuration

Application configuration is loaded in the following order:

1. **Default values** from `config/default.yaml`.
2. **Environment variables** (e.g., `FLASK_ENV`, `SECRET_KEY`).
3. **`.env` file** (automatically read by `python-dotenv`).

You can override any setting by defining the corresponding environment variable.

## Running the Application

### Development Server

flask --app app run --debug

The UI will be available at <http://127.0.0.1:5000/> and the API at <http://127.0.0.1:5000/api/calculate>.

### Production Server (Gunicorn)

gunicorn --workers 4 --bind 0.0.0.0:5000 "app:create_app()"

## Docker Support

### Build the image

docker build -t flask-calculator:latest .

### Run with Docker Compose

docker-compose up -d

The service will be reachable at <http://localhost:5000/>.

### Clean up

docker-compose down --rmi all --volumes --remove-orphans

## Testing

The project uses **pytest** for both unit and integration tests.

# Run all tests
pytest -v

# Run only unit tests
pytest tests/test_calculator.py -v

# Run only integration tests
pytest tests/test_routes.py -v

Coverage report (optional):

pip install pytest-cov
pytest --cov=app --cov-report=term-missing

## API Documentation

### `POST /api/calculate`

**Request Body (JSON)**

| Field | Type | Description |
|-------|------|-------------|
| `operation` | `string` | One of `"add"`, `"subtract"`, `"multiply"`, `"divide"` |
| `operands` | `list[number]` | Exactly two numeric values |

**Example**

{
  "operation": "add",
  "operands": [5, 3]
}

**Responses**

- `200 OK` – Successful calculation

    {
    "result": 8
  }
  
- `400 Bad Request` – Validation error (missing fields, wrong types, division by zero, etc.)

    {
    "error": "Division by zero is not allowed."
  }
  
## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Write code adhering to the project's style guidelines (PEP 8, Black, isort).
4. Add or update tests to cover new functionality.
5. Ensure all tests pass (`pytest -q`).
6. Submit a pull request with a clear description of changes.

### Code Style

- Run `black .` and `isort .` before committing.
- Lint with `flake8` (project CI enforces a maximum line length of 88 characters).

## License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

--- 

*Happy coding!*