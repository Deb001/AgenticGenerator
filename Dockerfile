FROM python:3.11-slim
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY . /app/
WORKDIR /app
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]