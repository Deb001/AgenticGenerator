# ------------------------------------------------------------
# Dockerfile for Flask Calculator Application
# ------------------------------------------------------------
# Base image: lightweight Python 3.11 (slim) with no extra OS packages
FROM python:3.11-slim

# Set environment variables for better runtime behavior
ENV PYTHONUNBUFFERED=1 \
    # Flask will look for this variable to locate the app entry point
    FLASK_APP=src/app.py \
    # Ensure Flask runs in production mode unless overridden at runtime
    FLASK_ENV=production

# Create a non‑root user to run the application securely
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for building any Python wheels
# (kept minimal; add more if your requirements need them)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy only the requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Install Python dependencies in a clean, cache‑free manner
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code
COPY . .

# Adjust ownership to the non‑root user
RUN chown -R appuser:appgroup /app

# Switch to the non‑root user
USER appuser

# Expose the default Flask port
EXPOSE 5000

# Optional healthcheck to verify the container is serving requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl -f http://localhost:5000/health || exit 1

# Default command to start the Flask development server (production-ready deployment
# should use a WSGI server like gunicorn; this keeps the original spec intact)
CMD ["flask", "run", "--host=0.0.0.0"]