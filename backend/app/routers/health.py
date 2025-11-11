from __future__ import annotations

import time
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.deps import get_db

router = APIRouter(tags=["health"])


@router.get("/healthz")
def healthz():
    return {"status": "ok"}


@router.get("/readyz")
def readyz(db: Session = Depends(get_db)):
    """Readiness probe validating DB and Redis connectivity."""
    settings = get_settings()
    checks: dict[str, dict] = {}

    # DB check
    t0 = time.perf_counter()
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    checks["db"] = {"ok": db_ok, "latency_ms": int((time.perf_counter() - t0) * 1000)}

    # Redis check
    t1 = time.perf_counter()
    redis_ok = False
    try:
        import redis

        client = redis.Redis.from_url(settings.redis_url or "redis://redis:6379/0", socket_connect_timeout=1.0, socket_timeout=1.0)
        redis_ok = bool(client.ping())
    except Exception:
        redis_ok = False
    checks["redis"] = {"ok": redis_ok, "latency_ms": int((time.perf_counter() - t1) * 1000)}

    status = "ready" if (db_ok and redis_ok) else "not_ready"
    code = 200 if status == "ready" else 503

    from fastapi.responses import JSONResponse

    return JSONResponse(content={"status": status, "checks": checks}, status_code=code)
