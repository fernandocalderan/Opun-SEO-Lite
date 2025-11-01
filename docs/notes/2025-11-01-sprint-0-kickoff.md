# Sprint 0 Kickoff - 01 Nov 2025

## Participantes
- Producto (PM)
- Arquitectura
- Frontend

## Objetivos de la reunion
- Validar el plan de frontend y priorizar el alcance de Sprint 0.
- Confirmar decision de stack documentada en ADR-0001.
- Alinear expectativas sobre entregables mock y contratos API.

## Decisiones clave
1. Next.js 15 + Tailwind + Storybook se mantiene como stack oficial; el ADR pasa a estado **Aprobado**.
2. Sprint 0 se enfocara en:
   - Layout base con modo claro/oscuro y navegacion lateral.
   - Configuracion de tooling (lint, tests, Storybook, Husky).
   - Mocks tipados para Overview, Reputation, Audits, Plan y Settings.
3. Las especificaciones OpenAPI se iran extendiendo por modulos y se sincronizaran con los mocks semanalmente.

## Acciones inmediatas
- Frontend: entregar layout temable y componentes fundacionales en Storybook.
- Producto: compartir criterios de aceptacion para Sprint 1 (dashboards) antes del 08 Nov.
- Arquitectura: revisar borrador de contratos API y documentar autenticacion base.

## Riesgos identificados
- Cambios de alcance en datos mock pueden romper historias en Storybook si no se versionan.
- Falta de definicion de errores API puede bloquear tests contractuales en Sprint 1.

## Seguimiento
- Standup semanal dedicado a progreso de Sprint 0 (martes 10:00h).
- Actualizacion de `docs/development-plan.md` al cierre de la semana.
