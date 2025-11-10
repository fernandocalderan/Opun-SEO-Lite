# Opun Intelligence Suite

Evolución de Opun SEO Lite hacia una plataforma orientada a SEO continuo e ingeniería reputacional.

Decisión actual: el backend se reinicia desde cero y ha sido retirado del repositorio. El frontend opera íntegramente con datos de mock hasta definir la nueva API.

## Estructura actual
- `docs/` – planes, ADRs y documentación estratégica.
- `frontend/` – workspace del frontend (Next.js + Tailwind). Ver `frontend/README.md`.
- `legacy/` – artefactos históricos.
- `requirements.txt` – placeholder para dependencias globales.

## Requisitos de entorno
- Linux/macOS
- Node.js >= 20.19.0 (`nvm use` con `.nvmrc` del repo)
- npm 10+

## Estado
- Backend/API: en rediseño; eliminado código previo y la infraestructura asociada.
- Frontend: activo con gateways que usan mocks cuando no hay `NEXT_PUBLIC_API_BASE_URL`.

### Navegación principal (WIP)
- `SEO` – resultado completo de auditorías (inline), historial y análisis rápido dentro de la página.
- `Reputation` – análisis de menciones, sentimiento y canales, y ranking de keywords con búsqueda rápida.
- `Plan` – backlog priorizado y seguimiento.
- `Monitoreo` – estado de proyectos con monitoreo activo y cola de auditorías.
- `Registro` – alta de proyectos/clientes y configuración (incluye preferencias).
- `Alerts` – feed unificado: auditorías pendientes + alertas reputacionales.

## Desarrollo (solo frontend con mocks)
1) Instalar dependencias: `cd frontend && npm install`
2) Ejecutar en local: `npm run dev`
3) Pruebas: `npm test`

Notas:
- `frontend/.env.local` no define `NEXT_PUBLIC_API_BASE_URL` para forzar mocks.
- Al definir la nueva API, reactivaremos esa variable y actualizaremos los gateways.
- La vista SEO usa un resultado de demo si no hay API.

Mantén este README actualizado conforme avance la implementación.
