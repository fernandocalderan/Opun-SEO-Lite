"""FastAPI skeleton for the Opun Intelligence Suite API Gateway."""

from fastapi import FastAPI

app = FastAPI(
    title="Opun Intelligence Suite API",
    version="0.1.0",
    description=(
        "API Gateway inicial para gestionar autenticación, auditorías, "
        "acciones CMS y reputación. Implementación completa pendiente."
    ),
)


@app.get("/health", tags=["health"])
def healthcheck() -> dict[str, str]:
    """Simple healthcheck endpoint to be expanded with dependency checks."""
    return {"status": "ok"}


@app.get("/v1/status", tags=["status"])
def platform_status() -> dict[str, str]:
    """Placeholder endpoint summarizing current platform readiness."""
    return {
        "stage": "foundation",
        "description": "Skeleton ready for multi-service implementation.",
    }
