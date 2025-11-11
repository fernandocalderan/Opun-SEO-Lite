# Plan de Frontend - Opun Intelligence Suite

> Estado: actualizado - 11 Nov 2025

## 1. Objetivo
Redisenar la experiencia web para agencias y equipos de reputacion, integrando auditoria SEO, ingenieria reputacional y colaboracion multi-equipo en una interfaz moderna, responsive y preparada para marca blanca.

## 2. Principios de Diseno
- **Claridad accionable**: cada insight debe indicar impacto, riesgo reputacional y proximo paso.
- **Contexto 360**: combinar senales SEO, reputacion y analitica en una vista coherente.
- **Colaboracion inmediata**: flujos claros para asignar tareas, comentar y compartir reportes.
- **Brand-ready**: soporte para personalizacion visual y multi-idioma desde el MVP.

## 3. Arquitectura Propuesta
- Framework: **Next.js 15 (App Router, React Server Components)**.
- Estilos: **Tailwind CSS** + design tokens propios, con Storybook 8 para documentar componentes.
- Estado cliente: **Zustand** para UI local + **React Query** para datos remotos.
- Autenticacion: API Key mínima activa. El frontend envía `x-api-key` si `NEXT_PUBLIC_API_KEY` está definido. OIDC/JWT en roadmap.
- Distribucion sugerida:
  - `frontend/src/app`: rutas y layouts.
  - `frontend/src/modules`: dominios funcionales (audits, reputation, workspace, settings).
  - `frontend/src/components`: libreria shared (atom/molecule/organism).
  - `frontend/src/lib`: clientes API, hooks, utils.
  - `frontend/src/styles`: design tokens y configuracion de Tailwind.

## 4. Roadmap de Implementacion
1. **Sprint 0 — Setup**
   - Inicializar proyecto (create-next-app, TypeScript estricto, ESLint + Prettier).
   - Configurar Tailwind, Storybook, Husky + lint-staged, testing (Vitest/Testing Library).
   - Crear layout base (sidebar + header) y tema claro/oscuro.
2. **Sprint 1 — Dashboards**
   - Home “Health Overview” con KPIs (SEO score, reputacion, riesgos criticos).
   - Widgets: SERP visibility, sentiment trend, alerts timeline.
   - Implementar mock API layer para datos.
3. **Sprint 2 — Auditoria**
   - Flujo para lanzar auditoria/manual upload (URL + keywords).
   - Secciones On-page, Rendimiento, Social, Crawl con estados semaforizados.
   - Integrar IA copy suggestions (UI para aceptar/descartar).
4. **Sprint 3 — Reputacion & ORM**
   - Vista “Reputation Watch” con SERP cards, reviews, social mentions, sentiment filters.
   - Matriz Riesgo x Impacto con quick actions (crear tarea, compartir, marcar resuelto).
5. **Sprint 4 — Plan & Colaboracion**
   - Kanban/list view para plan de acciones con owners, due dates y etiquetas.
   - Comentarios inline y sincronizacion con notificaciones (web/email).
   - Export/Share: generar decks PDF, links publicos controlados.
6. **Sprint 5 — Personalizacion & Marca Blanca**
   - Configuracion visual (logos, colores), dominios custom.
   - i18n (es/en) con next-intl.
   - Integracion basica con calendarios/Slack.

## 5. Experiencia de Usuario
- **Layouts**: navegacion lateral persistente (Overview, Audits, Reputation, Plan, Reports, Settings).
- **Dashboards**: tarjetas modulares con tooltips, trendlines y comparativas.
- **Detalle de auditoria**: tabs internas + timeline historico.
- **Plan**: tabla editable + vista Kanban + priorizacion por riesgo reputacional.
- **Report Builder**: editor visual con bloques arrastrables y exportacion inmediata.

## 6. Data e Integraciones
- Los gateways consumen API real cuando `NEXT_PUBLIC_API_BASE_URL` está definida; de lo contrario, usan mocks.
- Los requests incluyen cabeceras de autenticación si `NEXT_PUBLIC_API_KEY` o `NEXT_PUBLIC_BEARER` están definidas.
- Stubs para integraciones externas (Search Console, redes, reseñas) se activarán tras cerrar auth y contrato.

## 7. Design System
- Paleta base (brand/dark/light) documentada en Storybook.
- Componentes clave: KPICard, RiskBadge, TrendChart, TaskRow, PersonaAvatar, InsightPanel.
- Tipografia recomendada: Inter (UI), Space Grotesk (heading) — revisar licencias.

## 8. Metricas de Calidad
- Core Web Vitals LCP < 2.0s, CLS < 0.1.
- Accesibilidad AA (revisar con Lighthouse + axe).
- Cobertura de tests > 70% para componentes criticos.
- Zero Critical ESLint issues en main branch.

## 9. Entregables de Descubrimiento
- Wireframes baja fidelidad (Figma) para Overview, Auditoria y Plan.
- Design tokens iniciales + biblioteca Storybook.
- Documentacion de user flows para los roles: SEO Strategist, Reputation Manager, Agency Admin.

## 10. Próximos Pasos Inmediatos
1. Sustituir mocks por API en páginas donde ya existe backend (Overview/Audits/Reputation) activando `.env.local`.
2. Añadir manejo explícito de errores 409 (auditoría fallida) con CTA de reintento.
3. Playwright E2E para flujos críticos: lanzar auditoría, ver historial, abrir resultado y tabla de ranks.
4. CI: mantener lint/tests/build verdes en cada PR (workflow actualizado).

---

Mantener este documento actualizado al cierre de cada sprint.
