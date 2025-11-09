# Retail Shift Scheduler

This repository contains a Flask‑based web application for managing employee shift schedules.

## Project Structure

- **app.py** – Flask application factory.
- **config.py** – Central configuration object (database URI, secret key, etc.).
- **models.py** – SQLAlchemy ORM definitions for `Employee`, `Shift`, and `Notification`.
- **db_init.py** – Database creation and optional demo data seeding.
- **utils.py** – Helper functions for shift validation (overlap, consecutive shifts, weekly limits).
- **scheduler.py** – Core scheduling engine that generates deterministic schedules while respecting business rules.
- **routes.py** – Flask Blueprint exposing HTML views and JSON APIs.
- **templates/** – Jinja2 HTML templates for manager and employee interfaces.
- **static/** – CSS and JavaScript assets.
- **Dockerfile** – Container definition for production deployment.
- **requirements.txt** – Python dependencies.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/retail-shift-scheduler.git
   cd retail-shift-scheduler
   ```

2. **Create a virtual environment and install dependencies**
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # On Windows use `.venv\\Scripts\\activate`
   pip install -r requirements.txt
   ```

3. **Initialize the database**
   ```bash
   python db_init.py
   ```
   This will create a SQLite database file `retail.db` in the project root.

4. **Run the application**
   ```bash
   python app.py
   ```
   The app will be available at `http://127.0.0.1:5000/`.

5. **Docker deployment (optional)**
   ```bash
   docker build -t retail-scheduler .
   docker run -p 5000:5000 retail-scheduler
   ```

## Configuration

All configuration values are defined in `config.py`. Adjust `SQLALCHEMY_DATABASE_URI` if you wish to use a different database backend.

## License

This project is licensed under the MIT License.
