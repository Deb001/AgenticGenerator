# Flask Calculator Web Application

A lightweight, production‑ready calculator built with **Flask** that provides both a web UI and a JSON API for basic arithmetic operations. The project follows clean architecture principles, includes comprehensive unit tests, and is ready for deployment.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Error Handling & Logging](#error-handling--logging)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Web UI**: Interactive calculator with a responsive design.
- **RESTful API**: Perform calculations via `POST /api/calculate`.
- **Input Validation**: Robust validation for numeric inputs and supported operators.
- **Error Handling**: Graceful error responses with meaningful messages.
- **Logging**: Structured logging for debugging and monitoring.
- **Unit Tests**: 100% coverage of core arithmetic logic.
- **Docker Ready**: Simple Dockerfile (not included) can be added for containerization.

---

## Demo

![Calculator Screenshot](https://raw.githubusercontent.com/your-repo/flask-calculator/main/app/static/img/screenshot.png)

*Open `http://localhost:5000` after starting the server to see the UI.*

---

## Prerequisites

- **Python 3.9+**
- **pip** (Python package manager)
- (Optional) **virtualenv** or **conda** for isolated environments

---

## Installation

# Clone the repository
git clone https://github.com/your-repo/flask-calculator.git
cd flask-calculator

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

---

## Running the Application

### Development Server

# Start the Flask development server
python run.py

The app will be available at `http://127.0.0.1:5000`.

### Production (Gunicorn)

# Install gunicorn if not already installed
pip install gunicorn

# Run with 4 worker processes
gunicorn --workers 4 --bind 0.0.0.0:8000 run:app

*Adjust the number of workers based on your CPU cores.*

---

## API Reference

### POST `/api/calculate`

Perform a calculation.

#### Request Body (JSON)

| Field      | Type   | Description                                 |
|------------|--------|---------------------------------------------|
| `operand1` | number | First operand (int or float).               |
| `operand2` | number | Second operand (int or float).              |
| `operator` | string | One of `"add"`, `"subtract"`, `"multiply"`, `"divide"`.|

#### Example

curl -X POST http://localhost:5000/api/calculate \
     -H "Content-Type: application/json" \
     -d '{"operand1": 12, "operand2": 4, "operator": "divide"}'

#### Successful Response (200)

{
  "result": 3.0,
  "operator": "divide",
  "operands": [12, 4]
}

#### Error Responses

- **400 Bad Request** – Invalid JSON, missing fields, unsupported operator, or division by zero.

{
  "error": "Division by zero is not allowed."
}

---

## Testing

Run the test suite with **pytest**:

pip install pytest
pytest -v

All tests are located in `tests/test_calculator.py` and cover:

- Correctness of each arithmetic operation.
- Input validation and error handling.
- Edge cases (e.g., division by zero, large numbers).

---

## Project Structure

root/
├── app/
│   ├── __init__.py          # Flask app factory and blueprint registration
│   ├── calculator.py        # Core arithmetic functions
│   ├── routes.py            # UI and API route definitions
│   ├── templates/
│   │   └── index.html       # Calculator UI
│   └── static/
│       ├── css/
│       │   └── styles.css   # UI styling
│       └── js/
│           └── app.js       # Front‑end logic
├── tests/
│   └── test_calculator.py   # Unit tests
├── run.py                   # Entry point for `python run.py`
├── requirements.txt         # Python dependencies
└── README.md                # 📄 This documentation

---

## Error Handling & Logging

- **Input validation** is performed in `app/calculator.py`. Invalid inputs raise `ValueError` with descriptive messages.
- **API errors** are caught in `app/routes.py` and returned as JSON with appropriate HTTP status codes.
- **Logging** is configured in `app/__init__.py` using Python’s built‑in `logging` module. Logs include timestamps, log level, and request context, and are emitted to `stdout` (compatible with most container orchestration platforms).

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Write tests for your changes.
4. Ensure all tests pass (`pytest -q`).
5. Submit a Pull Request with a clear description of the changes.

Please adhere to the existing code style (PEP 8) and include docstrings for any new functions or classes.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

--- 

*Happy calculating! 🚀*