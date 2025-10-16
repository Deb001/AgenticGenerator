# Calculator Web Application

## Overview
A lightweight web calculator built with **Flask** (Python) for the backend and vanilla JavaScript for the frontend.  
The application provides a single-page UI where users can perform basic arithmetic operations.  
All calculations are processed server‑side via a JSON API (`/api/calculate`) and the result is displayed instantly in the browser.

Key features:
- RESTful API with clear request/response contract
- Input validation and comprehensive error handling
- Docker‑ready container image
- Full test suite (unit & integration)
- Contribution guidelines and CI‑friendly structure

## Prerequisites
| Tool | Minimum Version | Usage |
|------|----------------|-------|
| Python | 3.9 | Core language for the Flask backend |
| pip | 21.0 | Dependency management |
| Docker | 20.10 | Containerisation (optional but recommended) |
| Docker Compose | 2.0 | Orchestrating multi‑container setup |
| Git | 2.20 | Version control |

## Installation

### 1. Clone the repository
git clone https://github.com/your-org/calculator-webapp.git
cd calculator-webapp

### 2. Set up a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

### 3. Install Python dependencies
pip install -r requirements.txt

### 4. Configure environment variables
Copy the example file and adjust values as needed:
cp .env.example .env
Typical variables:
- `FLASK_ENV=development` (or `production`)
- `SECRET_KEY` – a random string used for session signing

## Running

### Local development server
flask --app src/app.py run
The app will be reachable at `http://127.0.0.1:5000`.

### Docker
docker compose up --build
The container exposes port **5000**; access the UI at `http://localhost:5000`.

## Testing

### Unit tests
pytest tests/unit

### Integration / end‑to‑end tests
pytest tests/integration

Both suites are also executed in the CI pipeline (`docker compose run --rm app pytest`).

## Deployment

### Production Docker image
docker build -t calculator-webapp:latest .
docker run -d -p 80:5000 --env-file .env calculator-webapp:latest

### Cloud platforms
The Docker image can be pushed to any container registry (Docker Hub, GitHub Packages, AWS ECR, etc.) and deployed to services such as **AWS ECS**, **Google Cloud Run**, or **Azure Container Apps**.  
Ensure the environment variables (`FLASK_ENV=production`, `SECRET_KEY`) are supplied securely via the platform’s secret manager.

## Contributing

1. **Fork** the repository and create a feature branch:
      git checkout -b feature/your-feature
   2. **Write code** adhering to the existing style (PEP 8, 4‑space indentation).  
   Add or update tests to cover new functionality.
3. **Run the full test suite** to ensure nothing breaks:
      pytest
   4. **Submit a Pull Request** with a clear description of the change and reference the related issue (e.g., `Fixes #AI-1`).

### Code of Conduct
All contributors must follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

### Reporting Issues
Open a GitHub issue with:
- A concise title
- Steps to reproduce (if applicable)
- Expected vs. actual behavior
- Relevant logs or screenshots

--- 

For detailed acceptance criteria, see `docs/acceptance_criteria.md`.  
Architecture diagrams and design decisions are documented in `docs/architecture.md`.  
Happy coding!