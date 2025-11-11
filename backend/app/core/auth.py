from __future__ import annotations

from fastapi import Depends, Header, HTTPException

from app.core.config import get_settings


def require_api_key(x_api_key: str | None = Header(default=None), authorization: str | None = Header(default=None)):
    settings = get_settings()
    keys = set(settings.api_keys or [])
    if not keys:
        # Sin claves configuradas: permitir en dev si esta habilitado
        if settings.allow_unauthenticated_in_dev and settings.environment.lower() in ("development", "dev"):
            return True
        raise HTTPException(status_code=401, detail="API key not configured")

    presented: str | None = None
    if x_api_key:
        presented = x_api_key.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        presented = authorization.split(" ", 1)[1].strip()

    if not presented or presented not in keys:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

