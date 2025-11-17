# ---------- Builder Stage ----------
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_VERSION=1.7.1
RUN pip install "poetry==$POETRY_VERSION"

# Copy only dependency files first for caching
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi --only main

# Copy application source code
COPY src ./src

# ---------- Runtime Stage ----------
FROM python:3.11-slim AS runtime
WORKDIR /app

# Create non‑root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy installed packages and source code from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /app/src ./src

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# Switch to non‑root user
USER appuser

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
