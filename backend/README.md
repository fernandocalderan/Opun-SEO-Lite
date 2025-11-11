Backend (FastAPI + Celery)

Servicios:
- API: FastAPI + Uvicorn (puerto 8000)
- Worker: Celery (cola Redis)
- Dev deps: PostgreSQL 16, Redis 7

Comandos (dev con Docker):

1) docker compose up --build (desde la raíz del repo)
   - API: http://localhost:8000/healthz y /readyz
2) (opcional) Migraciones Alembic:
   - docker compose exec api bash -lc "alembic upgrade head"

Variables importantes:
- DATABASE_URL (postgresql+psycopg://postgres:postgres@postgres:5432/opun)
- REDIS_URL (redis://redis:6379/0)
- OPENAI_API_KEY (necesaria para resumenes/sugerencias), SERPAPI_API_KEY (futuro)
- OPENAI_MODEL (por defecto gpt-4o-mini)
- ALLOWED_ORIGINS (por defecto http://localhost:3000)

Endpoints fase 1:
- GET /v1/projects
- POST /v1/projects
- PATCH /v1/projects/{id}
- DELETE /v1/projects/{id}

Endpoints fase 2 (MVP):
- POST /v1/audits
- GET /v1/audits/{id}/status
- GET /v1/audits/{id}/result
- GET /v1/audits/summary
- GET /v1/audits/history?limit&cursor
- GET /v1/audits/queue?limit&cursor
- GET /v1/audits/pending
- GET /v1/audits/performance

Endpoints fase 3 (Reputation v1):
- GET /v1/reputation/summary
- GET /v1/reputation/timeline
- GET /v1/reputation/channels
- GET /v1/reputation/mentions
- GET /v1/reputation/ranks?domain=...&kw=...&kw=...
