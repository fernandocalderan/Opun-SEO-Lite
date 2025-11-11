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
- Índices: `audit(status, created_at)`, `audit(project_id)`
- Endpoint `/v1/overview` básico con KPIs e insights desde el último resultado
- Scheduler idempotente (FOR UPDATE) y actualización de `last_audit_at`
- Readiness extendido (`/readyz` valida DB/Redis)

Integraciones:
- OpenAI (resumen ejecutivo y sugerencias): variable `OPENAI_API_KEY`, modelo `OPENAI_MODEL` (default `gpt-4o-mini`).

## Notas
- Vars: `DATABASE_URL`, `REDIS_URL`, `OPENAI_API_KEY`, `SERPAPI_API_KEY`, `ALLOWED_ORIGINS`, `API_KEYS`
- En dev usar `docker compose up --build` y `alembic upgrade head`
- En prod: Alembic antes de actualizar servicio ECS

## Fase 3 – Reputation v1 (completada)
- Endpoints: `/v1/reputation/summary|timeline|channels|mentions`
- Endpoint: `/v1/reputation/ranks?domain&kw=` con SERPAPI + caché en DB (`serprankcache`, TTL 15m)
- Fallback determinístico si no hay SERPAPI o error de red

## Fase 4 – Seguridad y Observabilidad (en curso)
- Autenticación por API Key (cabecera `x-api-key`) aplicada a routers `/v1/*` (excepto health) y support Bearer.
- Logging estructurado (JSON) con `request_id`/`audit_id` y métricas como logs (`audits.*`).
- Próximo: endpoint `/metrics` (Prometheus) y rate‑limit básico.

## Backlog próximo
- Endpoint `/metrics`; export a CloudWatch/Prometheus.
- Rate‑limit por IP/API key.
- Tests unitarios (servicios) e integración (routers) + fixtures DB.
- Archivar `legacy/streamlit` cuando la paridad funcional esté verificada.
