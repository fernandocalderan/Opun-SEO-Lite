# Frontend (Next.js + Tailwind)

Workspace para el nuevo dashboard de Opun Intelligence Suite.

## Scripts principales

```bash
npm run dev          # servidor Next.js (http://localhost:3000)
npm run storybook    # UI sandbox (http://localhost:6006)
npm run test         # pruebas unitarias (Vitest)
npm run format       # aplica Prettier sobre src/
npm run lint         # ESLint con reglas Next + Storybook
```

> Nota: Storybook intentará usar el puerto 6006. Si está ocupado aceptá la alternativa sugerida o libera el puerto con `npx kill-port 6006`.

## Estructura

```
src/
├─ app/            # Rutas Next.js (App Router)
├─ components/     # Componentes compartidos (UI, layouts)
├─ modules/        # Features por dominio (overview, reputation, plan…)
├─ lib/            # Clientes, helpers y mocks (ver lib/mocks)
├─ styles/         # Design tokens y estilos específicos
└─ stories/        # Storybook stories de referencia
```

## Flujo de trabajo
1. Trabaja cualquier feature con datos mock desde `lib/mocks`.
2. Documenta componentes nuevos en Storybook (`src/stories` o módulo correspondiente).
3. Ejecuta `npm run test` y `npm run lint` antes de abrir PR. El hook `pre-commit` (Husky + lint-staged) valida los archivos modificados.
4. Mantén `docs/frontend-plan.md` y los ADRs sincronizados con las decisiones que tomes.
