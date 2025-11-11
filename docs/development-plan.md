# Plan de Desarrollo Consolidado - Opun Intelligence Suite

> Última actualización: 11 Nov 2025  
> Responsable: Equipo de Plataforma

## 1. Estado actual
- Frontend (Next.js) operativo con módulos Overview, Audits y Reputation. Gateways consumen API real cuando se define `NEXT_PUBLIC_API_BASE_URL` y ahora envían `x-api-key` si está configurado.
- Backend (FastAPI + Celery + SQLAlchemy + Alembic) activo con `/v1/projects`, `/v1/audits/*`, `/v1/reputation/*`, `/v1/overview`, health `/healthz` y `/readyz` extendido (DB/Redis). Logging JSON, scheduler idempotente y reintentos/backoff en `run_audit`.
- Legacy Streamlit: duplicación funcional respecto a Audits; se mantendrá como referencia hasta completar migración.

## 2. Objetivo
Consolidar en un único stack (FastAPI + Next.js), retirando el legacy y preparando el despliegue con seguridad, observabilidad y CI/CD.

## 3. Roadmap (4–6 semanas)
1) Consolidación y seguridad (Semana 1)
- Autenticación básica por API Key en backend (completado) y uso desde frontend (completado).
- CORS por entorno, rate‑limit simple (pendiente).
- Documentación OpenAPI actualizada (pendiente).

2) Integración real end‑to‑end (Semanas 1–2)
- Sustituir mocks por API donde sea posible usando `NEXT_PUBLIC_API_BASE_URL` (activo).
- Manejo explícito de `failed` en `/v1/audits/{id}/result` con 409 (completado) y UX de error en frontend (pendiente pequeño ajuste).

3) Observabilidad y fiabilidad (Semanas 2–3)
- Métricas mínimas (audits.created/completed/failed, duración) emitidas como logs estructurados (completado). Exponer `/metrics` Prometheus (pendiente).
- Ampliar logs con `request_id` y `audit_id` (completado).

4) CI/CD y calidad (Semanas 2–4)
- Workflows GitHub Actions: frontend (lint/tests/build) y backend (instalación + compile check) (completado). Añadir tests unitarios/integración (pendiente).

5) Migración Streamlit → backend/UI (Semanas 3–6)
- Portar heurísticas de meta/social/performance/redirecciones al servicio backend y exponer resultados.
- Archivar `legacy/streamlit` tras verificar paridad funcional.

## 4. Backlog inmediato
- Endpoint `/metrics` para Prometheus (API).  
- Rate‑limit básico (por IP/API key) y endurecer CORS por entorno.
- Tests backend (unitarios de servicios y de routers con DB en memoria) y tests de componentes/Playwright en FE.
- Documentación OpenAPI (+ ejemplos de error) y README de despliegue.

## 5. Operación y entornos
- Variables clave: `API_KEYS`, `DATABASE_URL`, `REDIS_URL`, `OPENAI_API_KEY`, `SERPAPI_API_KEY`, `ALLOWED_ORIGINS`.
- Frontend: define `NEXT_PUBLIC_API_BASE_URL` y `NEXT_PUBLIC_API_KEY` para usar API real.

## 6. Métricas de éxito
- Tiempo medio de auditoría < 10s (MVP), tasas de error de worker < 2%.
- Cobertura mínima 70% en módulos críticos backend; zero errores ESLint en main.
- Dashboard de métricas básico (latencia API, created/completed/failed) visible en Cloud/Prometheus.

## 7. Comunicación
- Tablero único con etiquetas `backend`, `frontend`, `infra`, `observability`.
- ADRs para cambios relevantes (auth, almacenamiento resultados, export), notas semanales en `docs/notes`.
