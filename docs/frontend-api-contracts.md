# API Contracts - Frontend Expectations

> Ultima actualizacion: 01 Nov 2025

La version formalizada de los contratos esta disponible en [`docs/frontend-api-contracts.openapi.yaml`](frontend-api-contracts.openapi.yaml). El archivo sigue OpenAPI 3.1 e incorpora los esquemas JSON que consume el frontend.

## Hoja rapida por dominio

| Dominio     | Endpoints clave                                                                 | Esquemas principales |
|-------------|----------------------------------------------------------------------------------|----------------------|
| Overview    | `GET /v1/overview`                                                               | `OverviewResponse`, `OverviewKpi`, `OverviewAlert`, `OverviewInsight` |
| Auditorias  | `GET /v1/audits/summary`, `GET /v1/audits/queue`, `GET /v1/audits/history`       | `AuditSummaryResponse`, `AuditQueueItem`, `AuditHistoryItem` |
| Reputacion  | `GET /v1/reputation/sentiment/timeline`, `GET /v1/reputation/channels`, `GET /v1/reputation/mentions` | `SentimentPoint`, `ChannelBreakdownItem`, `ReputationMention` |
| Plan        | `GET /v1/plan/board`, `GET /v1/plan/table`                                       | `PlanBoardResponse`, `PlanTableRow` |
| Reportes    | `GET /v1/reports`, `GET /v1/reports/templates`, `POST /v1/reports/generate`      | `ReportResource`, `ReportTemplate`, `ReportGenerationRequest` |
| Settings    | `GET /v1/settings`                                                               | `SettingsConfiguration`, `ProjectSettings`, `SeoSettings`, `ReputationSettings` |

## Notas de alineacion

- **Paginacion**: los listados paginados comparten la convencion `{ items: [], next_cursor }`. Cuando `next_cursor` es `null` el frontend deshabilita el boton de "Cargar mas".
- **Autenticacion**: todos los endpoints aceptan `Authorization: Bearer <token>` o `x-api-key`. El spec define ambos esquemas para facilitar pruebas.
- **Campos numericos**: los porcentajes en reputation y plan se envian ya normalizados (0-1). El frontend multiplica por 100 segun necesidad.
- **Compatibilidad mocks**: los ejemplos del spec reflejan los datos mock en `frontend/src/src/lib/mocks`, permitiendo mapear las integraciones reales sin cambios en UI.
- **Formato camelCase**: Overview y Settings exponen claves en camelCase para alinear directamente con los stores de React Query/Zustand del frontend.

> Cualquier cambio futuro debe actualizar el YAML y este resumen para mantener trazabilidad frontend-backend.
