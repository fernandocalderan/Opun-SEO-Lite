# Opun Intelligence Suite

Evolucion de **Opun SEO Lite** hacia una plataforma SaaS multi-tenant orientada a SEO continuo e ingenieria reputacional.  
El repositorio se ha reorganizado para reiniciar la capa frontend y mantener el legado separado.

## Estructura actual
- `docs/` – planes, ADRs y documentacion estrategica (`frontend-plan.md`, `frontend-api-contracts.md`, etc.).
- `frontend/` – workspace del nuevo frontend (ver `frontend/README.md`).
- `legacy/` – artefactos historicos de referencia (app Streamlit original).
- `requirements.txt` – placeholder para dependencias globales (vacio por ahora).

## Estado
- **Backend/API**: pendiente de redisenar (consulta `docs/development-plan.md`).
- **Frontend**: planificado en `docs/frontend-plan.md`, listo para iniciar con Next.js + Tailwind.
- **CI/CD & Infra**: se configuraran nuevamente cuando se definan los stacks finales.

## Proximos pasos sugeridos
1. Validar el plan frontend con stakeholders y registrar ADRs clave.
2. Inicializar el proyecto web dentro de `frontend/src` siguiendo el plan (Sprint 0).
3. Definir la arquitectura backend y alinear los contratos API con el frontend.
4. Reutilizar, si aplica, ideas del legacy Streamlit durante el redisen.

Mantener este README actualizado conforme avance la implementacion.
