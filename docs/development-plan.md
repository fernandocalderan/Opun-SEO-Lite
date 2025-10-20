# Opun Intelligence Suite — Development Plan

## 1. Vision and Guiding Principles
- Evolucionar **Opun SEO Lite** a una plataforma SaaS multi-tenant orientada a agencias y marcas.
- Combinar auditorías SEO, acciones automáticas en CMS y defensa de reputación (ORM) en una misma suite.
- Diseñar la plataforma con enfoque **API-first**, seguridad enterprise (OIDC, RBAC) y observabilidad nativa.
- Reducir el **Time-To-Value** a menos de 48 horas desde el alta hasta la primera acción aplicada.

## 2. Arquitectura Lógica
### 2.1 Capas de Experiencia
- **Web App (Next.js)** con App Router, SSR/ISR y marca blanca.
- **Admin/Agency Console** en Next.js para operaciones multi-proyecto.
- **Plugins CMS** (WordPress, Shopify, Webflow) distribuidos como SDK JS y apps oficiales.

### 2.2 Borde y Control
- **API Gateway** basado en FastAPI detrás de Traefik/Nginx Ingress.
- **Auth Service** gestionado con Keycloak u Ory (OAuth2/OIDC, SSO, SAML).
- **Rate limiting** por plan mediante Kong/Envoy o implementación propia.

### 2.3 Servicios de Dominio
- **Audit Orchestrator** (colas + workers especializados).
- **Servicios de auditoría** desacoplados: Meta, Social, Perf, Crawl.
- **Crawling/Fetch** con Playwright opcional para JS rendering.
- **ORM Watcher + Reputation Scorer** para monitorizar SERPs/redes.
- **AI Service** con router multi-modelo, caching y guardrails.
- **Report Builder** para HTML/PDF con plantillas marca blanca.
- **CMS Actions** (conectores/webhooks para aplicar cambios).
- **Integrations Hub** (GSC, GA4, Semrush/Ahrefs, Slack, HubSpot, Zapier).
- **Billing & Metering** (Stripe, consumo por URL/API).

### 2.4 Capa de Datos
- **PostgreSQL** (OLTP multi-tenant) con RLS.
- **Redis** (caché de sesiones y colas de vida corta).
- **S3-compatible** para reportes y snapshots HTML.
- **ClickHouse** para métricas de auditoría y costes.
- **OpenSearch/Elastic** para texto libre en issues y menciones.

### 2.5 Infraestructura y Operación
- **Kubernetes** (GKE/EKS/AKS) + ArgoCD/GitHub Actions para CD.
- **Kafka/RabbitMQ** como event bus + colas.
- **Observabilidad** con OpenTelemetry, Prometheus, Grafana, Loki.
- **Feature flags** con Unleash o GrowthBook.

## 3. Modelo de Datos (Esencial)
### 3.1 Tenancy
- `accounts(id, plan, brand_prefs, …)`
- `users(id, account_id, role, sso_id, …)`
- `api_keys(id, account_id, scopes, rate_limit, …)`

### 3.2 Dominios y Jobs
- `projects(id, account_id, name, domain, cms_type, connectors…)`
- `audits(id, project_id, type, status, started_at, finished_at, score, …)`
- `audit_items(id, audit_id, url, category, severity, issue_code, payload_json)`
- `keywords(id, project_id, keyword, intent, value_estimate)`
- `actions(id, project_id, type, target, ai_proposal, status, applied_at)`
- `reports(id, project_id, html_url, pdf_url, summary_json)`

### 3.3 Reputación y Costes
- `mentions(id, project_id, source, url, sentiment, visibility, serp_position)`
- `reputation_scores(id, project_id, score, drivers_json)`
- `usage_events(id, account_id, metric, value, unit, ts)`
- `billing_invoices(id, account_id, period, amount, details_json)`
- `serp_timeseries(project_id, keyword, position, ts, source)`
- `audit_metrics(project_id, metric, value, ts)`

## 4. Contratos de API (Resumen)
- `POST /v1/audits:start` — recibe `{project_id, urls?, depth?, keywords?}` y retorna `audit_id`.
- `GET /v1/audits/{id}` — estado, puntuaciones e issues.
- `POST /v1/ai/copy/rewrite` — genera títulos/meta/H1/H2.
- `POST /v1/cms/apply` — ejecuta acciones aprobadas en el CMS.
- `GET /v1/reputation/score` — devuelve score y drivers.
- `POST /v1/integrations/connect` — inicia OAuth con GSC, GA4, Slack, HubSpot.
- `GET /v1/reports/{id}` — URLs de HTML/PDF.
- `GET /v1/usage` — métricas de consumo.
- **Webhooks**: `audit.completed`, `reputation.alert`, `actions.applied`, `billing.threshold`.

## 5. Servicios Clave
### 5.1 Audit Orchestrator
- Colas: `audit_requests`, `fetch_queue`, `analysis_queue`.
- Workers autoscalables por tipo (meta/social/perf/crawl).
- Respeto de `robots.txt`, rate-limit por dominio y user-agent propio.

### 5.2 AI Service
- Router multi-modelo (OpenAI/Claude/Gemini) con fallback local.
- Prompt templates versionados y guardrails (validación JSON via Pydantic).
- Caching en Redis con fingerprint por input.
- Contador de costes → `usage_events`.

### 5.3 ORM Watcher + Reputation Scorer
- Scraping programado de SERPs (pág. 1–5) y foros (Reddit/X).
- Clasificación de sentimiento (zero-shot) y scoring ponderado.
- Recomendaciones defensivas (clusters contenido, interlinking, backlinks).

### 5.4 CMS Actions
- Plugins para WordPress, Shopify y Webflow.
- Flujo: Dry-run → Approval → Apply + rollback con snapshot.

### 5.5 Report Builder
- Plantillas Jinja2 → HTML + WeasyPrint/Playwright para PDF.
- Personalización marca blanca por `account.brand_prefs`.

## 6. Seguridad y Cumplimiento
- Auth OIDC, RBAC/ABAC por `account_id`.
- JWT cortos + refresh, API Keys con scopes y rate limiting.
- Postgres con Row Level Security para aislamiento multi-tenant.
- Gestión de secretos con Vault/Secrets Manager.
- Cumplimiento GDPR: registros, borrado selectivo, data minimization.
- WAF, DDoS básico, CSP/HSTS, clasificación de PII en logs.

## 7. Observabilidad y Calidad
- Trazas y métricas con OpenTelemetry → Grafana/Tempo/Loki.
- SLIs/SLOs: latencia P95, tasa de errores, TTR, backlog de colas.
- Testing: unitarios (pytest), contract testing (Pact), e2e (Playwright), carga (k6).
- Chaos engineering ligero para resiliencia.
- Canary releases y feature flags.

## 8. CI/CD e Infraestructura
- Monorepo (Turborepo) o multi-repo por servicio; decisión pendiente.
- GitHub Actions: lint, tests, seguridad (Bandit, Trivy, Semgrep), build Docker, deploy con ArgoCD.
- IaC con Terraform + Helm; entornos Dev/Stage/Prod.
- HPA por CPU/mensajes en cola; backups Postgres (WAL) y S3 versionado.

## 9. Roadmap (12 Meses)
1. **Fase 0 (2–3 semanas)** — Base: infra mínima, auth básico, skeleton Next.js, API GW.
2. **Fase 1 (6–8 semanas)** — Auditorías v1, reportes HTML/PDF, panel proyectos.
3. **Fase 2 (6 semanas)** — CMS Actions + Integraciones.
4. **Fase 3 (8 semanas)** — ORM + Reputation.
5. **Fase 4 (6 semanas)** — Multi-tenant Pro + Billing.
6. **Fase 5 (8 semanas)** — IA Predictiva con ClickHouse + forecasting.

## 10. Embudos y Automatizaciones
- Lead magnet: auditoría gratuita (3 URLs) → proyecto demo.
- Activación: checklist guiado (conectar GSC, keywords, plugin CMS).
- Lifecycle: alertas Slack/Email con acciones rápidas.
- Retención: reportes mensuales automáticos + score de avance.

## 11. Indicadores y Supuestos
- Éxito: TTV < 48h, P95 API < 400ms, CTR lift IA +3–7%, retención M3 > 75%.
- Coste IA/URL < 0,03 € gracias a caching.
- Incidencias < 2 por 1k auditorías.
- Supuestos: demanda creciente de automatización SEO/ORM, estabilidad de APIs externas, costes IA controlados.

## 12. Próximos Pasos Inmediatos
1. Seleccionar proveedor cloud (recomendado GCP) y provisionar Postgres/Redis/S3/K8s via IaC.
2. Crear esqueletos de repositorios y pipeline CI/CD con plantillas de servicio FastAPI.
3. Implementar `Audit Orchestrator` + `Audit-Meta` end-to-end (cola → worker → reporte).
4. Definir MVP del plugin WordPress (aplicar meta/OG automáticamente).
5. Activar facturación Stripe y rate limiting en API Gateway.

