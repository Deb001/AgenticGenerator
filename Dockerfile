FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=src/app.py

CMD ["gunicorn", "src.app:create_app()", "-b", "0.0.0.0:8000"]