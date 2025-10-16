FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies required for some Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    apt-get purge -y --auto-remove gcc

# Copy the rest of the application source code
COPY . .

# Expose the port the Flask app runs on
EXPOSE 5000

# Create a non‑root user for running the application
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser /app
USER appuser

# Start the application using Gunicorn
CMD ["gunicorn", "app:create_app()", "--bind", "0.0.0.0:5000"]