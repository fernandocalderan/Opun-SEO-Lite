# Backend Foundations

Este directorio contiene la estructura base para los servicios que compondrán Opun Intelligence Suite. Cada subcarpeta representa un microservicio o componente independiente que se desplegará en Kubernetes siguiendo el modelo descrito en `docs/development-plan.md`.

## Servicios Iniciales
- `api_gateway/`: FastAPI que expone la API pública y actúa como fachada.
- `services/audit_orchestrator/`: orquestación de auditorías y distribución en colas.
- `services/audit_meta/`, `audit_social/`, `audit_perf/`, `audit_crawl/`: workers especializados.
- `services/ai_service/`: router de modelos IA y guardrails.
- `services/report_builder/`: generación de reportes HTML/PDF.
- `services/cms_actions/`: conectores con CMS y aplicación de cambios.
- `services/integrations_hub/`: integraciones externas (GSC, GA4, etc.).
- `services/reputation/`: monitoreo ORM y scoring reputacional.

Cada servicio dispondrá de su propio Dockerfile, despliegues Helm y pipelines de CI/CD a medida. Por ahora solo se establecen los cimientos y convenciones iniciales.
