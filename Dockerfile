# syntax=docker/dockerfile:1

# ------------------------------------------------------------
#  Base image
# ------------------------------------------------------------
FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# ------------------------------------------------------------
#  Create a non‑root user for security
# ------------------------------------------------------------
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

# ------------------------------------------------------------
#  Working directory
# ------------------------------------------------------------
WORKDIR /app

# ------------------------------------------------------------
#  Install dependencies
# ------------------------------------------------------------
# Copy only the requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Install Python packages; the build will fail automatically if pip returns a non‑zero exit code
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# ------------------------------------------------------------
#  Copy application source code
# ------------------------------------------------------------
COPY . .

# Adjust ownership so the non‑root user can read/write the files
RUN chown -R appuser:appgroup /app

# ------------------------------------------------------------
#  Runtime configuration
# ------------------------------------------------------------
EXPOSE 5000

# Flask entry point
ENV FLASK_APP=src/app.py

# ------------------------------------------------------------
#  Run as non‑root user
# ------------------------------------------------------------
USER appuser

# ------------------------------------------------------------
#  Default command
# ------------------------------------------------------------
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]