# syntax=docker/dockerfile:1

############################
# Stage 1: Builder
############################
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install build‑time dependencies (gcc for possible compiled wheels)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

############################
# Stage 2: Runtime
############################
FROM python:3.11-slim AS runtime

# Set working directory
WORKDIR /app

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    FLASK_APP=src/app.py \
    FLASK_RUN_HOST=0.0.0.0

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy application source code
COPY src/ ./src/

# Expose the Flask/Gunicorn port
EXPOSE 5000

# Run the application with Gunicorn (4 workers)
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "src.app:app"]