# ===============================
# Dockerfile - Opun API Gateway (Render Compatible)
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

# --- Variables por defecto (Render las puede sobreescribir) ---
ENV PORT=8000

# --- Comando de arranque ---
# Se usa la ruta absoluta del módulo FastAPI
# --- Alembic y servidor ---
CMD ["bash", "-c", "cd /app/backend/api_gateway && python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

