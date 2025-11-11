Backend – Dev Plan (Fase 0–2)

## Fase 0 (completada)
- Bootstrap FastAPI + CORS
- Health endpoints `/healthz`, `/readyz`
- Celery worker base (Redis)
- Dockerfile + docker-compose con API/worker/Postgres/Redis

## Fase 1 (completada) – Projects
- SQLAlchemy + base `project`
- Alembic init + migración `create_projects`
- Endpoints `/v1/projects` (GET, POST, PATCH, DELETE)
- Autocreación de tablas en dev; en prod usar Alembic

## Fase 2 (en curso) – Audits MVP
- Modelos: `audits`, `audit_results`
- Endpoints: `POST /v1/audits`, `GET /v1/audits/{id}/status|result`, `GET /v1/audits/summary|history|queue|pending|performance`
- Worker `run_audit` (payload base + resumen/sugerencias con OpenAI)
- Normalización de respuestas (snake_case)

Integraciones:
- OpenAI (resumen ejecutivo y sugerencias): variable `OPENAI_API_KEY`, modelo `OPENAI_MODEL` (default `gpt-4o-mini`).

## Notas
- Vars: `DATABASE_URL`, `REDIS_URL`, `OPENAI_API_KEY`, `SERPAPI_API_KEY`, `ALLOWED_ORIGINS`
- En dev usar `docker compose up --build` y `alembic upgrade head`
- En prod: Alembic antes de actualizar servicio ECS

## Fase 3 – Reputation v1 (completada)
- Endpoints: `/v1/reputation/summary|timeline|channels|mentions`
- Endpoint: `/v1/reputation/ranks?domain&kw=` con SERPAPI + caché en DB (`serprankcache`, TTL 15m)
- Fallback determinístico si no hay SERPAPI o error de red
