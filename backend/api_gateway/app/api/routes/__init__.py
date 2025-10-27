"""Register FastAPI routes."""

from fastapi import APIRouter

from . import accounts, audits, projects

api_router = APIRouter()
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(audits.router, prefix="/audits", tags=["audits"])

__all__ = ["api_router"]
