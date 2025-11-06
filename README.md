# Opun Intelligence Suite

Evolucion de **Opun SEO Lite** hacia una plataforma SaaS multi-tenant orientada a SEO continuo e ingenieria reputacional.  
El repositorio se ha reorganizado para reiniciar la capa frontend y mantener el legado separado.

## Estructura actual
- `docs/` – planes, ADRs y documentacion estrategica (`frontend-plan.md`, `frontend-api-contracts.md`, etc.).
- `frontend/` – workspace del nuevo frontend (ver `frontend/README.md`).
- `legacy/` – artefactos historicos de referencia (app Streamlit original).
- `requirements.txt` – placeholder para dependencias globales (vacio por ahora).

## Requisitos de entorno
- Linux (Ubuntu 22.04+ probado) o macOS.
- Node.js >= 20.19.0 (usar `nvm use` con el `.nvmrc` del repo).
- npm 10+ (incluido con Node 20). Para instalar dependencias: `cd frontend && npm install`.

## Estado
- Backend/API: prototipo Fastify en `backend/` con worker mock y stores JSON.
- Frontend: Next.js en `frontend/`.
- CI/CD & Infra: dockerizado localmente y esqueleto Terraform para AWS (ECS Fargate + ALB + ECR).

## Proximos pasos sugeridos
1. Validar el plan frontend con stakeholders y registrar ADRs clave.
2. Inicializar el proyecto web dentro de `frontend/` siguiendo el plan (Sprint 0).
3. Definir la arquitectura backend y alinear los contratos API con el frontend.
4. Reutilizar, si aplica, ideas del legacy Streamlit durante el redisen.

Mantener este README actualizado conforme avance la implementacion.
\n+## Docker (local)
- Backend: `docker compose up -d --build backend`
- Worker: `docker compose up -d --build worker`
\n+Ambos comparten un volumen para `backend/.data`.
\n+## Despliegue AWS (Terraform)
- Ver `infra/terraform/README.md` para crear: VPC, ALB, ECS Fargate y ECR.
- Recomendado publicar la imagen del backend en ECR y pasarla vía `-var 'container_image=...'` en `terraform apply`.
