# Opun Intelligence Suite

Evolución de **Opun SEO Lite** hacia una plataforma SaaS multi-tenant orientada a agencias y marcas. El repositorio contiene los cimientos del backend (FastAPI + PostgreSQL) y artefactos legacy de la solución Streamlit original.

## Estado Actual (Oct 2025)
- **API Gateway** (`backend/api_gateway`) operando con modelos multi-tenant, migración inicial y stack local vía Docker Compose.
- **Plan de desarrollo iterativo** actualizado en `docs/development-plan.md`, con roadmap de 12 semanas y backlog priorizado.
- **CI/CD** en proceso de depuración (workflow `docker-image.yml` listo para ajustes de lint/tests).
- **Aplicación Streamlit** reubicada en modo legacy (`legacy/streamlit`) para referencia histórica durante la migración.

## Puesta en Marcha Local
1. Crear entorno de variables:
   ```bash
   cp backend/api_gateway/.env.example backend/api_gateway/.env
   ```
2. Levantar servicios:
   ```bash
   docker-compose up --build
   ```
3. Accesos rápidos:
   - API FastAPI → http://localhost:8000 (docs interactivas en `/docs`).
   - PostgreSQL → `localhost:5432` (usuario `postgres`, contraseña `postgres`).
   - PGAdmin → http://localhost:5050 (credenciales en `docker-compose.yml`).

Para ejecutar la API sin Docker, instala dependencias (`backend/api_gateway/requirements.txt`) y usa `uvicorn backend.api_gateway.main:app --reload` con Postgres local.

## Flujo de Trabajo
- Sprints de 2 semanas con demos y retrospectivas. Detalles en `docs/development-plan.md`.
- Ramas: `main` (estable), `develop` (integración), ramas feature con PR obligatorio y pipeline verde.
- Estándares de ingeniería: tipado estricto, `ruff` + `black`, pruebas `pytest` (incluyendo async).

## Estructura de Carpetas
- `backend/api_gateway/`: servicio FastAPI principal (modelos, esquemas, rutas, servicios, Alembic).
- `backend/services/`: esqueletos para microservicios (Audit Orchestrator, AI, CMS, etc.).
- `docs/`: plan de desarrollo y futuros ADRs.
- `legacy/streamlit/`: código histórico de la aplicación Streamlit mientras se completa su migración.
- `.github/workflows/`: pipelines CI/CD (pendientes de ajuste según backlog Sprint 1).

## Próximos Entregables Prioritarios
1. Lint + pruebas automatizadas en CI (`ruff`, `pytest`, build Docker).
2. Pruebas unitarias para `AccountService`, `ProjectService`, `AuditService`.
3. Scripts de automatización (invoke/make) para tareas locales.
4. Stub funcional del Audit Orchestrator con cola y worker meta.
5. Documentación de contratos API → Frontend/SDK.

Mantén la documentación viva: cualquier cambio relevante debe reflejarse en este README y en el plan de desarrollo.
