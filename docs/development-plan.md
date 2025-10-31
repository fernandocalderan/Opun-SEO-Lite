# Plan de Desarrollo Iterativo - Opun Intelligence Suite

> Ultima actualizacion: 31 Oct 2025  
> Responsable: Equipo de Plataforma

## 1. Objetivo General
- Redisenar desde cero la capa **frontend** como prioridad, obteniendo una experiencia robusta y documentada que sirva de referencia y contrato para el backend.
- Definir la arquitectura backend en paralelo a nivel documental (contratos, ADRs, esquema de datos) para habilitar su implementacion en una fase posterior.
- Construir con calidad desde el dia uno: automatizacion, observabilidad y seguridad integradas en cada iteracion.

### Metricas de Exito (fase frontend-first)
- Prototipo navegable con datos mock en <=6 semanas, validado con stakeholders.
- Documentacion completa de los contratos API que el frontend requiere (OpenAPI/JSON schemas) antes de iniciar el backend real.
- Pipeline CI del frontend con lint + tests activo desde el primer sprint funcional.

## 2. Inventario Actual
- **Frontend**: estructura inicial en `frontend/` y plan detallado en `docs/frontend-plan.md`. Codigo aun no inicializado.
- **Backend**: pendiente de redisenar; solo documentacion. No hay servicios ni contenedores activos.
- **Documentacion**: este plan, el plan de frontend y ADRs listos para registrar decisiones.
- **Legacy**: app Streamlit en `legacy/streamlit/` como referencia historica.

## 3. Enfoque de Trabajo
1. **Fase Frontend (prioritaria)**
   - Implementar el plan de `docs/frontend-plan.md` (Sprint 0 -> Sprint 5) con datos mock y especificaciones API.
   - Consolidar design system, navegacion y dashboards reputacionales.
   - Documentar contratos esperados del backend (payloads, endpoints, eventos) en la misma fase.
2. **Fase Backend (posterior)**
   - Basarse en los contratos acordados con el frontend para construir servicios reales.
   - Definir ADRs de stack backend y roadmap especifico una vez listo el frontend.
3. **Integracion**
   - Reemplazar mocks por cliente real, anadir observabilidad end-to-end y ajustar performance.

## 4. Lineas de Trabajo Propuestas

### 4.1 Frontend y Experiencia
- Seguir la arquitectura propuesta (Next.js + Tailwind + Storybook) con enfasis en reputacion.
- Crear dashboards con KPIs SEO/ORM, flujo de auditoria y plan colaborativo.
- Preparar internacionalizacion, tema claro/oscuro y personalizacion de marca.

### 4.2 Contratos y Documentacion Backend
- Definir esquemas de datos y endpoints requeridos usando JSON Schema/OpenAPI.
- Registrar ADRs sobre autenticacion, multi-tenant, modelo de datos.
- Mantener mocks actualizados para pruebas de frontend.

### 4.3 Observabilidad y Tooling
- Configurar CI/CD frontend (lint, tests, build). Documentar necesidades de monitoreo futuro.
- Planificar observabilidad backend, aunque se implemente despues.

## 5. Roadmap de 12 Semanas (frontend-first)
| Semana | Objetivo | Entregables clave |
|--------|----------|-------------------|
| 1-2 | Sprint 0 (setup) | Proyecto Next.js inicializado, tooling configurado, wireframes confirmados, mock API base. |
| 3-4 | Sprint 1 (dashboards) | Vista Overview con KPIs reputacionales, componentes en Storybook, contratos API preliminares. |
| 5-6 | Sprint 2 (auditoria) | Flujo completo de auditoria con datos mock, integracion IA en UI, documentacion endpoints `/audits`. |
| 7-8 | Sprint 3 (reputacion) | Modulo Reputation Watch, matrices riesgo x impacto, contratos `/reputation` y eventos. |
| 9-10 | Sprint 4 (plan y colaboracion) | Kanban/lista de tareas, exportaciones, notas colaborativas, especificacion `/actions` y `/reports`. |
| 11-12 | Sprint 5 (personalizacion y handoff) | Tema marca blanca, i18n basico, handoff backend con OpenAPI consolidado, backlog de backend priorizado. |

## 6. Backlog Inmediato
1. Validar `docs/frontend-plan.md` con stakeholders y registrar ADR-0001 (stack frontend).
2. Preparar mock data y esquemas en `frontend/src/lib/mocks`.
3. Inicializar proyecto Next.js (Sprint 0) siguiendo el plan.
4. Documentar contratos API requeridos (OpenAPI borrador) para soporte backend posterior.
5. Definir lineamientos de integracion backend -> frontend (autenticacion, errores, versionado).

## 7. Estandares de Ingenieria
- **Frontend**: TypeScript estricto, ESLint + Prettier, tests con Vitest/React Testing Library, Storybook para componentes.
- **Documentacion**: ADRs obligatorios para decisiones mayores, OpenAPI para contratos, changelog por sprint.
- **Backend (futuro)**: se establecera una vez definido el stack, pero debera alinearse con los contratos ya documentados por el frontend.

## 8. Riesgos y Mitigaciones
- **Desfase frontend-backend** -> mantener especificaciones actualizadas y reviews periodicas entre equipos.
- **Cambios de scope tras prototipo** -> registrar ajustes en ADRs y planificar refactors controlados.
- **Dependencia de IA/external APIs** -> mockear y documentar fallback para no bloquear desarrollo.

## 9. Comunicacion y Gestion
- Tablero (Linear/Jira) con etiquetas `frontend`, `contracts`, `backend` para claridad.
- Cadencia: weekly sync entre frontend y arquitectura para validar contratos.
- Actualizar este plan y el frontend-plan al cierre de cada sprint.

---

### Proxima Revision
- Tras Sprint 0 del frontend (aprox. 2 semanas) o antes si se modifica el stack.
