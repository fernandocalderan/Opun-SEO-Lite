# Opun Backend Prototype

Servicio Fastify en TypeScript que expone el endpoint `/v1/overview` con datos mock alineados al contrato documentado en `docs/frontend-api-contracts.openapi.yaml`.

## Requisitos
- Node.js >= 20

## Comandos

```bash
npm install        # instala dependencias
npm run dev        # ejecuta servidor con recarga en http://localhost:3333
npm run build      # compila a JavaScript en dist/
npm start          # arranca el servidor compilado
npm test           # corre las pruebas con Vitest + Supertest
```

## Notas
- Las respuestas se validan con Zod antes de enviarse para asegurar el contrato.
- Ajusta los mocks en `src/mocks/overview.ts` a medida que evolucione el payload real.
