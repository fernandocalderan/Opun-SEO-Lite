from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/healthz")
def healthz():
    return {"status": "ok"}


@router.get("/readyz")
def readyz():
    # En fase 0 devolvemos listo; en fases posteriores se validará DB/Redis
    return {"status": "ready"}

