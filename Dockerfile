FROM python:3.11-slim

# Create a non‑root user and group
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY backend/ .

# Expose the Flask port
EXPOSE 5000

# Ensure output is not buffered
ENV PYTHONUNBUFFERED=1

# Switch to non‑root user
USER appuser

# Run the application with Gunicorn
CMD ["gunicorn", "app:create_app()", "-b", "0.0.0.0:5000", "--workers", "2"]
