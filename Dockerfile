# Use the official lightweight Python 3.11 image as base
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy only the dependency file first to leverage Docker cache
COPY requirements.txt .

# Install dependencies without caching to keep image size small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port that Flask will listen on
EXPOSE 5000

# Optional: healthcheck to ensure the app is running
HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the Flask application
CMD ["python", "app.py"]