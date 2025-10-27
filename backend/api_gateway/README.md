# API Gateway (FastAPI)

Este servicio expone la API publica de Opun Intelligence Suite utilizando **FastAPI**, **SQLAlchemy** (async) y **PostgreSQL**. Incluye migraciones Alembic y contenedores Docker listos para desarrollo local.

## Caracteristicas
- Modelado multi-tenant con `accounts`, `projects`, `audits` y mas.
- Dependencias asincronicas con `asyncpg` y manejo de sesiones por request.
- Migraciones administradas mediante Alembic (`alembic/versions`).
- Orquestacion local con `docker-compose` (API + PostgreSQL).
- Validacion de datos con Pydantic v2 y `pydantic-settings` para la configuracion.

## Requisitos
- Python 3.11+ (para uso fuera de Docker).
- Docker + Docker Compose.
- `pip` para instalar dependencias si se ejecuta localmente.

## Configuracion
1. Copia el archivo de ejemplo y ajusta credenciales si es necesario:
   ```bash
   cp backend/api_gateway/.env.example backend/api_gateway/.env
   ```
2. Verifica y ajusta `DATABASE_URL` en el `.env` (usa el driver `postgresql+asyncpg`).

## Ejecucion con Docker
```bash
docker-compose up --build
```
Esto levanta:
- `api`: servicio FastAPI disponible en `http://localhost:8000`.
- `db`: PostgreSQL con la base `opun_api`.

Puedes acceder a la documentacion interactiva en `http://localhost:8000/docs`.

## Migraciones
- Crear una nueva migracion (desde `backend/api_gateway`):
  ```bash
  alembic revision --autogenerate -m "descripcion"
  ```
- Aplicar migraciones:
  ```bash
  alembic upgrade head
  ```

## Ejecucion local (sin Docker)
```bash
python -m venv .venv
source .venv/bin/activate  # En Windows usa .venv\Scripts\activate
pip install -r backend/api_gateway/requirements.txt
uvicorn backend.api_gateway.main:app --reload
```

## Endpoints iniciales
- `GET /health`: estado del servicio.
- `GET /v1/status`: estado de la plataforma.
- `POST /v1/accounts`: crea una cuenta.
- `GET /v1/accounts/{id}` y `PATCH /v1/accounts/{id}`.
- `POST /v1/accounts/{id}/projects`: crea un proyecto.
- `POST /v1/audits/projects/{project_id}`: lanza una auditoria y gestiona `audit_items`.

Cada endpoint valida y serializa datos mediante los esquemas definidos en `app/schemas/`.

## Estructura principal
- `app/core`: configuracion, logging y dependencias comunes.
- `app/models`: modelos SQLAlchemy (multi-tenant).
- `app/schemas`: modelos Pydantic para entrada/salida.
- `app/api`: routers de FastAPI.
- `app/services`: capa de servicios con la logica de negocio.
- `alembic/`: configuracion y versiones de migraciones.

> Nota: este servicio esta disenado para escalar con autenticacion delegada y microservicios especializados segun el plan de desarrollo (`docs/development-plan.md`).
