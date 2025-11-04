# Checklist de Handoff Backend – Overview `/v1/overview`

> Version 2025-11-03 · Responsable: Frontend/Arquitectura  
> Objetivo: asegurar que el equipo backend cuente con los requisitos operativos para implementar el endpoint `/v1/overview` tras la validacion del Sprint 1.

## Autenticacion y Autorizacion
- [ ] Definir proveedor OIDC / API Keys provisional y esquemas de cabeceras requeridos.
- [ ] Documentar alcance de scopes/roles necesarios (Reputation Manager, Analyst, PO).
- [ ] Especificar manejo de sesiones expiradas y propagacion de errores 401/403 en el contrato.
- [ ] Validar requisitos de auditoria (registro de consultas, IP, tenant) con Seguridad.

## Datos y Paginacion
- [ ] Confirmar campos finales de alertas (incluye `channel`, `source`, `published_at`, `url`).
- [ ] Definir origen de datos para KPIs (servicio SEO, ORM, agregaciones) y frecuencia de refresco.
- [ ] Establecer version inicial del esquema (`v1`) y estrategia de cambios compatibles.
- [ ] Alinear limites de paginacion/segmentacion para insights y alertas (incluir query params futuros).

## SLA y Observabilidad
- [ ] Establecer SLA objetivo (p95 < 400 ms, disponibilidad 99.5%) y plan de degradacion.
- [ ] Definir metrica de observabilidad (trazas, logs estructurados, dashboard APM).
- [ ] Documentar escenarios de error (timeout fuentes externas, datos incompletos) y respuestas fallback.
- [ ] Registrar alertas operativas y owners responsables (NOC, Equipo Reputation).

## Entregables y Seguimiento
- [ ] OpenAPI actualizado en `docs/frontend-api-contracts.openapi.yaml`.
- [ ] Fixtures/mocks sincronizados en `frontend/src/lib/mocks`.
- [ ] Notas de validacion en Storybook (`Pages/Overview`) adjuntadas al acta de Sprint Review.
- [ ] Aprobacion en Sprint Review (14 Nov 2025) por Arquitectura y Producto.
