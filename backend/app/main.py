import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import health as health_router
from app.routers import projects as projects_router
from app.routers import audits as audits_router
from app.routers import reputation as reputation_router
from app.db.base import Base
from app.db.session import engine


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router.router)
    app.include_router(projects_router.router)
    app.include_router(audits_router.router)
    app.include_router(reputation_router.router)

    @app.get("/")
    def root():
        return {"service": settings.app_name, "env": settings.environment}

    return app


app = create_app()

# Fase 1 dev: crear tablas si no existen (en prod usar Alembic)
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
