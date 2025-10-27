# Opun Intelligence Suite (Foundations)

Este repositorio contiene la evolucion de **Opun SEO Lite** hacia una plataforma SaaS multi-tenant que combina auditoria SEO continua, automatizacion en CMS y defensa de reputacion.

## Estado actual
- Aplicacion Streamlit existente para auditorias bajo demanda.
- Plan estrategico documentado en `docs/development-plan.md`.
- API Gateway operativo (`backend/api_gateway`) con modelos FastAPI + PostgreSQL + Docker Compose.
- Estructura base creada para los servicios backend (FastAPI API Gateway + microservicios especializados).

## Proximos pasos
1. Provisionar la infraestructura base (Postgres, Redis, S3-compatible, Kubernetes) mediante IaC.
2. Integrar autenticacion delegada (Keycloak/Ory) en el API Gateway.
3. Implementar el Audit Orchestrator y los primeros workers (Meta, Social) conectados a colas.
4. Migrar gradualmente la logica actual de auditoria Streamlit hacia servicios desacoplados.
5. Preparar el frontend Next.js y los plugins CMS segun el roadmap.

Consulta el documento del plan para mas detalles y coordinaciones: [`docs/development-plan.md`](docs/development-plan.md).

