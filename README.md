# Flask Calculator API

A lightweight Flask application that provides a RESTful API for evaluating arithmetic expressions. The project includes a simple web UI, Docker support, and a comprehensive test suite.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup (Local Development)](#setup-local-development)
- [Docker Setup](#docker-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)
- [Contact](#contact)

---

## Features

- **REST API**: `/api/calculate` endpoint that evaluates arithmetic expressions safely.
- **Web UI**: Interactive calculator built with HTML/CSS/JavaScript.
- **Dockerized**: Easy containerized deployment.
- **Environment Configuration**: `.env` support for secret keys and Flask environment.
- **Automated Tests**: Unit and integration tests with `pytest`.
- **Extensible Architecture**: Clear separation of concerns (config, routes, templates, static assets).

---

## Prerequisites

| Tool | Minimum Version |
|------|-----------------|
| Python | 3.9 |
| pip | 21.0 |
| Docker | 20.10 |
| Docker Compose | 2.0 |
| Git | 2.20 |

---

## Setup (Local Development)

1. **Clone the repository**

      git clone https://github.com/yourusername/flask-calculator-api.git
   cd flask-calculator-api
   
2. **Create a virtual environment**

      python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   
3. **Install dependencies**

      pip install -r requirements.txt
   
4. **Configure environment variables**

      cp .env.example .env
   # Edit .env if you need to change defaults
   
5. **Run database migrations (if applicable)**  
   *No database is required for this project.*

6. **Start the development server**

      flask --app src/app.py run --debug
   
   The API will be available at `http://127.0.0.1:5000` and the UI at `http://127.0.0.1:5000/`.

---

## Docker Setup

### Build the image

docker compose build

### Run the containers

docker compose up -d

The application will be reachable at `http://localhost:5000`.

### Stop and remove containers

docker compose down

---

## Running the Application

### Using Flask CLI (local)

export FLASK_APP=src/app.py
export FLASK_ENV=development   # or production
flask run

### Using Docker (production)

docker compose up -d

### Accessing the UI

Open a browser and navigate to `http://localhost:5000`. The calculator UI loads automatically.

### API Endpoint

- **POST** `/api/calculate`
  - **Request JSON**

        {
      "expression": "2 * (3 + 4) / 5"
    }
    
  - **Success Response (200)**

        {
      "result": 2.8
    }
    
  - **Error Response (400)**

        {
      "error": "Invalid expression"
    }
    
Full API specification is available in [`docs/api.md`](docs/api.md).

---

## Testing

Run the test suite with `pytest`:

pytest -v

The tests cover:

- Route existence and status codes
- Expression evaluation correctness
- Error handling for malformed input
- UI static file serving

---

## Contribution Guidelines

1. **Fork the repository** and create a new branch for your feature or bug fix.

      git checkout -b feature/awesome-feature
   
2. **Write tests** for any new functionality.

3. **Follow code style**:  
   - Use **PEP 8** for Python files.  
   - Run `flake8` and `black` before committing.

4. **Update documentation** if you add or modify public interfaces.

5. **Submit a Pull Request** with a clear description of changes and reference any related issue (e.g., `Closes #AI-1`).

---

## License

This project is licensed under the **MIT License** – see the [`LICENSE`](LICENSE) file for details.

---

## Contact

- **Author**: Your Name  
- **Email**: youremail@example.com  
- **GitHub**: [yourusername](https://github.com/yourusername)

Feel free to open an issue or submit a pull request for any improvements or bug reports.