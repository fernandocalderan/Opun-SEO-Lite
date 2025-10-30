# Plan de Desarrollo Iterativo — Opun Intelligence Suite

> Última actualización: 27 Oct 2025  
> Responsable: Equipo de Plataforma

## 1. Objetivo General
- Consolidar la evolución de Opun SEO Lite hacia una plataforma SaaS multi-tenant gestionable por agencias.
- Entregar valor incremental cada 2 semanas, con entregables revisables y desplegables en entornos controlados.
- Mantener una deuda técnica baja mediante pruebas automatizadas, observabilidad básica y CI/CD desde la primera iteración.

### Métricas de Éxito
- Primer flujo “create account → create project → trigger audit → obtener resultados mock” operativo en ≤6 semanas.
- Tiempo de aprovisionamiento local <15 minutos documentado y validado.
- Cobertura automática mínima: unitarias 40%, pruebas de contrato básicas para el API Gateway.

## 2. Inventario Actual
- **API Gateway (FastAPI)** con modelos y migración inicial de cuentas, proyectos y auditorías.
- **Stack local** basado en Docker Compose (FastAPI + Postgres + PGAdmin).
- **Aplicación Streamlit legado** (auditorías on demand) → se mantiene en modo “legacy” hasta migración completa.
- **CI/CD**: workflow GitHub Actions con placeholders y sin pruebas registradas.
- **Servicios adicionales** (Audit Orchestrator, AI, CMS, Integrations, Frontend) aún sin implementación.

## 3. Enfoque de Trabajo (Sprints de 2 semanas)
1. **Kick-off de sprint (Lunes)**: repaso del backlog priorizado y definición de objetivos.
2. **Daily async** (Slack/Linear): actualización breve de bloqueos y avances.
3. **Demo interna (Jueves Sprint 2)**: revisión de entregables funcionales.
4. **Retro + Refinamiento (Viernes Sprint 2)**: identificación de mejoras y selección de backlog siguiente.

Repositorios permanecen en monorepo, con ramas feature → PR → branch `develop` → merge `main` cada sprint estable.

## 4. Workstreams y Entregables

### 4.1 API Gateway Hardening
- Autenticación API Keys + integración futura con proveedor OIDC (Keycloak u Ory).
- Validaciones Pydantic, serialización y pruebas unitarias en rutas `/accounts`, `/projects`, `/audits`.
- Gestión de migraciones Alembic automatizada en CI.

### 4.2 Audit Orchestrator & Workers
- Definir contratos `AuditRequest` y `AuditResult` (Pydantic) entre gateway y orquestador.
- Implementar cola interna (Redis Streams o PostgreSQL JSON + polling) como stub temporal.
- Worker “meta” inicial que consume cola y persiste `audit_items` simulados.

### 4.3 Data & Observability Foundations
- Centralizar la configuración en `.env` y `config.py` con perfiles `local` y `preview`.
- Añadir OpenTelemetry SDK (logging + traces básicos) y health metrics (prometheus exporter opcional).
- Backups automáticos de la base local (scripts) y migraciones reproducibles.

### 4.4 Frontend & Integraciones (Descubrimiento)
- Documentar API Contracts para futura Web App (Next.js) y consola de agencias.
- Seleccionar estrategia de autenticación (SSR + tokens) y preparar mock server.
- Mantener Streamlit solo como referencia, etiquetándola como legacy.

## 5. Roadmap de 12 Semanas

| Semana | Objetivo | Entregables clave |
|--------|----------|-------------------|
| 1-2 (Sprint 1) | **API Gateway estable** | Pruebas unitarias básicas, swagger documentado, pipeline CI con lint + tests, scripts make/Invoke. |
| 3-4 (Sprint 2) | **Auditorías simuladas end-to-end** | Contratos orquestador, worker meta stub, endpoints `/audits` retornan items mock persistidos. |
| 5-6 (Sprint 3) | **Seguridad y accesos** | Gestión de API keys completa, políticas de rate limiting, integración inicial con Keycloak (local). |
| 7-8 (Sprint 4) | **Observabilidad mínima** | Métricas /health enriquecido, traces básicos, dashboards iniciales (Grafana o equivalente). |
| 9-10 (Sprint 5) | **Preparación Frontend/SDK** | API contracts publicados, mock server, kickoff Next.js repo. |
| 11-12 (Sprint 6) | **Despliegue Preview** | Render/Cloud Run preview con pipeline automatizado, demo pública controlada. |

## 6. Backlog Priorizado (Siguiente Sprint)
1. Limpiar workflow GitHub Actions y añadir pasos: lint (`ruff`), pruebas (`pytest`), build Docker.
2. Añadir pruebas unitarias para servicios `AccountService`, `ProjectService`, `AuditService` (fixtures async).
3. Preparar scripts `invoke` o `Makefile` para tareas comunes (test, lint, format, compose-up).
4. Estandarizar `.env` → `.env.example` y documentar pasos de arranque en README actualizado.
5. Marcar la app Streamlit como `legacy/` y documentar plan de migración.

## 7. Estándares de Ingeniería
- **Lenguaje**: Python 3.11+, tipado estricto, `mypy` opcional a partir del Sprint 3.
- **Formateo**: `ruff` + `black` (modo compatible).
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`…).
- **Testing**: usar `pytest-asyncio` para rutas/servicios; mínimo un test por endpoint público.
- **Documentación**: README y `docs/` actualizados al cierre de cada sprint; changelog incluido en PRs relevantes.

## 8. Riesgos y Mitigaciones
- **Sobrecarga del monolito legacy** → aislar artefactos en `legacy/` y migrar gradualmente.
- **Falta de pruebas CI** → bloquear merges a `main` sin pipeline verde.
- **Gestión de secretos** → usar variables en GitHub/Render, nunca commit de secretos.
- **Dependencia de servicios externos** → mantener stubs/mocks hasta acuerdos definitivos.

## 9. Comunicación y Herramientas
- Gestión de backlog en Linear (o Jira) con labels `api`, `orchestrator`, `observability`, `frontend`.
- Notas técnicas cortas en `docs/adr/` para decisiones clave (driver DB, colas, autenticación).
- Slack canal `#opun-platform` para updates diarios; retro/decisiones capturadas en Notion.

---

### Próxima Revisión del Plan
- Semana 3, post-demo Sprint 2. Ajustar roadmap según avances y nueva información comercial.
