# Mocks Frontend - Convenciones

## Objetivo
Centralizar datos de referencia para Sprint 0 y las primeras iteraciones del frontend. Los mocks ayudan a validar UI/UX sin depender del backend aun en construccion.

## Lineamientos
- Todos los datasets deben exportarse tipados usando las interfaces en `types.ts`.
- Los archivos se agrupan por dominio (`dashboard`, `audits`, `plan`, `reputation`, `reports`, `settings`).
- El index de la carpeta (`index.ts`) reexporta los modulos para facilitar importaciones (`import { kpiSummary } from "@/lib/mocks"`).
- Mantener valores en castellano salvo terminos de producto ya definidos (por ejemplo, `Plan`, `Overview`).
- Evitar caracteres especiales no ASCII para prevenir problemas de codificacion transversal.

## Flujo de actualizacion
1. Ajustar el dataset en el archivo correspondiente.
2. Sincronizar ejemplos en `docs/frontend-api-contracts.openapi.yaml`.
3. Actualizar historias de Storybook y pruebas que dependan del mock.
4. Anotar cambios relevantes en `docs/notes` o en el changelog del sprint.
