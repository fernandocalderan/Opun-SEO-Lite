# Opun Intelligence Suite (Foundations)

Este repositorio contiene la evolución de **Opun SEO Lite** hacia una plataforma SaaS multi-tenant que combina auditoría SEO continua, automatización en CMS y defensa de reputación.

## Estado Actual
- Aplicación Streamlit existente para auditorías bajo demanda.
- Plan estratégico documentado en `docs/development-plan.md`.
- Estructura base creada para los servicios backend (FastAPI API Gateway + microservicios especializados).

## Próximos Pasos
1. Provisionar la infraestructura base (Postgres, Redis, S3-compatible, Kubernetes) mediante IaC.
2. Inicializar el API Gateway (`backend/api_gateway`) con autenticación delegada (Keycloak/Ory).
3. Implementar el Audit Orchestrator y los primeros workers (Meta, Social) conectados a colas.
4. Migrar gradualmente la lógica actual de auditoría Streamlit hacia servicios desacoplados.
5. Preparar el frontend Next.js y los plugins CMS según el roadmap.

Consulta el documento del plan para más detalles y coordinaciones: [`docs/development-plan.md`](docs/development-plan.md).
