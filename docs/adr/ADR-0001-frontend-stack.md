# ADR-0001: Seleccion de stack para el nuevo frontend

## Estado
Aprobado - 01 Nov 2025

## Contexto
Necesitamos reiniciar la experiencia web de Opun Intelligence Suite con foco en reputacion y SEO. Buscamos un stack moderno que permita:

- Renderizado hibrido (SSR/ISR) para SEO y dashboards con datos en tiempo casi real.
- Buen DX (TypeScript, tooling maduro, ecosistema amplio).
- Soporte para design system compartido (Storybook) y modularidad por dominios.
- Integracion sencilla con APIs REST/GraphQL futuras y endpoints de IA.
- Capacidad para personalizacion de marca y despliegue multi-entorno.

Se evaluaron tres opciones principales:

1. **Next.js (React)**
   - Pros: ecosistema grande, App Router con Server Components, SSR/ISR/hibrido, integracion nativa con Vercel, soporte excelente para Tailwind y Storybook, comunidad amplia.
   - Contras: curva adicional con Server Components; depende de Node.js en runtime.

2. **Remix**
   - Pros: routing jerarquico limpio, streaming de datos, buen soporte para loaders/actions.
   - Contras: ecosistema mas pequeno; menor integracion con Storybook y herramientas existentes; la adopcion corporativa es menor.

3. **Astro + React Islands**
   - Pros: enfoque contenido-first, excelente rendimiento estatico, posibilidad de mezclar frameworks.
   - Contras: dashboards altamente interactivos requieren mas configuracion; ecosistema ORM/SEO SaaS mas limitado.

## Decision
Adoptamos **Next.js 15 (App Router) + TypeScript** como base, complementado por:

- **Tailwind CSS** para layout y design tokens, con configuracion personalizada.
- **Storybook 8** para documentar componentes UI.
- **Zustand** para estado local/controlado de UI.
- **React Query** para fetching y cache de datos asincronicos.
- Testing con **Vitest + React Testing Library**.

## Consecuencias

### Positivas
- Acceso a ecosistema maduro (plantillas, librerias de graficos, soporte IA, etc.).
- SSR/ISR out-of-the-box para paginas publicas (reportes compartibles).
- Integracion fluida con Next Auth / OIDC a futuro.
- Buen soporte para internacionalizacion (next-intl) y personalizacion (middleware + theming).
- Tooling consistente (ESLint, Turbopack, linters) y despliegue sencillo (Vercel/Render).

### Negativas / Riesgos
- Debemos gestionar adecuadamente la frontera Client/Server Components para evitar complejidad.
- Stack Node/React requiere consideraciones de rendimiento para dashboards pesados (bundles, splitting).
- Dependencia en meta-framework (Next) implica seguir su ritmo de versiones.

### Acciones derivadas
- Iniciar Sprint 0 con `npx create-next-app --ts` dentro de `frontend/src`.
- Configurar Tailwind, Storybook, Vitest y lint-staged segun el plan de frontend.
- Documentar patrones de uso de Server Components y layout por modulos.
- Preparar mock APIs (JSON/handlers) usando Next.js Route Handlers mientras el backend se disena.
