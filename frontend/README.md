# Frontend (Next.js + Tailwind)

Este workspace contiene el nuevo dashboard web de Opun Intelligence Suite.

## Primeros pasos

```bash
cd frontend
nvm use                # instala/activa la version definida en .nvmrc si es la primera vez
npm install            # instala dependencias en frontend/node_modules
npm run dev            # ejecuta Next.js en http://localhost:3000
```

### Scripts principales

```bash
npm run storybook      # UI sandbox (http://localhost:6006)
npm run test           # pruebas unitarias (Vitest)
npm run lint           # ESLint con reglas Next + Storybook
npm run format         # Prettier sobre src/
```

> Storybook usa el puerto 6006. Si está ocupado, acepta la alternativa o libera el puerto con `npx kill-port 6006`.

## Estructura

```
src/
├─ app/            # Rutas Next.js (App Router)
├─ components/     # Componentes compartidos (UI, layouts)
├─ modules/        # Features por dominio (overview, reputation, plan…)
├─ lib/            # Clientes, helpers y mocks (ver lib/mocks)
├─ styles/         # Design tokens y estilos específicos
└─ stories/        # Storybook stories agrupadas por flujo
public/            # Assets estáticos (logos, ilustraciones, manifest, etc.)
.storybook/        # Configuracion y decorators de Storybook
```

## Navegación (WIP)
- SEO (resultado completo, historial y búsqueda rápida)
- Reputation (menciones, sentimiento, canales y ranking de keywords)
- Plan (backlog y seguimiento)
- Monitoreo (proyectos activos + cola de auditorías)
- Registro (alta de proyectos y preferencias)
- Alerts (auditorías pendientes + alertas)

## Flujo de trabajo recomendado
1. Desarrolla cada feature contra los mocks en `src/lib/mocks` y documenta las dependencias de contrato.
2. Crea o actualiza historias en Storybook (`src/stories` o el módulo correspondiente) para acelerar el feedback de diseño.
3. Antes de abrir PR ejecuta `npm run lint` y `npm run test`. Husky + lint-staged validan los archivos modificados en `pre-commit`.
4. Mantén `docs/frontend-plan.md`, los contratos OpenAPI y los ADRs sincronizados con los cambios de producto/arquitectura.
