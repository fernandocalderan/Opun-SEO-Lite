import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import configure_json_logging
from app.core.middleware import request_id_middleware, access_log_middleware
from app.routers import health as health_router
from app.routers import metrics as metrics_router
from app.routers import projects as projects_router
from app.routers import audits as audits_router
from app.routers import reputation as reputation_router
from app.db.base import Base
from app.db.session import engine


def create_app() -> FastAPI:
    settings = get_settings()
    # Configure JSON logging early
    configure_json_logging(settings.log_level)
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # request id + access log middleware for correlation across logs
    app.middleware("http")(request_id_middleware)
    app.middleware("http")(access_log_middleware)

    app.include_router(health_router.router)
    app.include_router(metrics_router.router)
    from fastapi import Depends
    from app.core.auth import require_api_key

    # Rutas publicas
    app.include_router(health_router.router)
    # Rutas protegidas (v1)
    app.include_router(projects_router.router, dependencies=[Depends(require_api_key)])
    app.include_router(audits_router.router, dependencies=[Depends(require_api_key)])
    app.include_router(reputation_router.router, dependencies=[Depends(require_api_key)])
    try:
        from app.routers import overview as overview_router
        app.include_router(overview_router.router, dependencies=[Depends(require_api_key)])
    except Exception:
        # overview router optional during early development
        pass

    @app.get("/")
    def root():
        return {"service": settings.app_name, "env": settings.environment}

    return app


app = create_app()

# Solo en desarrollo: crear tablas si no existen (en prod usar Alembic)
try:
    settings = get_settings()
    if settings.environment.lower() in ("development", "dev"):  # evitar en prod/staging
        Base.metadata.create_all(bind=engine)
except Exception:
    pass


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
