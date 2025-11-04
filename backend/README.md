# Opun Backend Prototype

Servicio Fastify en TypeScript que expone endpoints `/v1/overview` y `/v1/audits/*`. Las rutas de auditorías leen/escriben en un store JSON persistido y se inicializan con los mocks actuales.

## Requisitos
- Node.js >= 20

## Comandos

```bash
npm install        # instala dependencias
npm run dev        # ejecuta servidor con recarga en http://localhost:3333
npm run build      # compila a JavaScript en dist/
npm start          # arranca el servidor compilado
npm test           # corre las pruebas con Vitest + Supertest
npm run worker     # procesa auditorías pendientes (mock funcional)
```

## Notas
- Las respuestas se validan con Zod antes de enviarse para asegurar el contrato.
- Las rutas `/v1/audits/summary|queue|history|performance|pending` ahora se sirven desde `backend/.data/audits.json`. Si el archivo no existe, se crea a partir de los mocks de `src/mocks/audits.ts`.
- Nuevo flujo mínimo real:
  - `POST /v1/audits` encola una auditoría (`pending`).
  - `npm run worker` simula la ejecución, marcando `running` y luego `completed`, generando resultados e historial.
  - `GET /v1/audits/:id/status` y `GET /v1/audits/:id/result` permiten consultar progreso/resultado.

### Resultado de auditoría (V0/V1)

El worker genera un resultado estructurado con secciones complementarias:

- `seo_meta`: metadatos on‑page + relevancia por keyword.
- `crawl_indexability`: redirects, cabeceras, x‑robots, robots/sitemap.
- `performance`: TTFB, tamaño HTML, imágenes/enlaces, compresión y caché.
- `social`: OG/Twitter + relevancia por keyword.
- `serp`: opcional (array de filas) si `SERPAPI_KEY` está configurada (V2).
- `scores`: onpage/indexability/wpo/social/overall.

Variables de entorno opcionales:

- `SERPAPI_KEY`: activa la sección `serp` usando SerpAPI (Google) cuando existan keywords.
- `OPENAI_API_KEY`: si está presente, el worker genera un `executive_summary.html` con un resumen ejecutivo (modelo configurable con `OPENAI_MODEL`, por defecto `gpt-3.5-turbo`).
