"""FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import api_router
from .core.config import get_settings
from .db.session import init_db


def create_app() -> FastAPI:
    """Instantiate the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url=settings.docs_url,
        redoc_url=settings.redoc_url,
        debug=settings.debug,
    )

    if settings.cors_allow_origins:
        origins = (
            settings.cors_allow_origins
            if isinstance(settings.cors_allow_origins, list)
            else [settings.cors_allow_origins]
        )
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=settings.cors_allow_credentials,
            allow_methods=settings.cors_allow_methods,
            allow_headers=settings.cors_allow_headers,
        )

    @app.on_event("startup")
    async def _startup() -> None:  # pragma: no cover - simple wrapper
        if settings.environment == "local":
            await init_db()

    @app.get("/health", tags=["health"])
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/v1/status", tags=["status"])
    async def platform_status() -> dict[str, str]:
        return {
            "stage": settings.environment,
            "description": "API gateway operational",
        }

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app
