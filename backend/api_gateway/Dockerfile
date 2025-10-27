# ===============================
# Dockerfile - Opun API Gateway
# ===============================

FROM python:3.11-slim AS base

# --- Configuración base ---
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# --- Dependencias del sistema ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl && \
    rm -rf /var/lib/apt/lists/*

# --- Dependencias Python ---
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# --- Copia del código fuente ---
COPY . /app

# --- Alembic y servidor ---
# Nos movemos al directorio real donde está la app
CMD bash -c "cd /app/backend/api_gateway && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"
