from __future__ import annotations

from fastapi import APIRouter, Response

from app.core.metrics import render_prometheus


router = APIRouter()


@router.get("/metrics")
def metrics():
    payload = render_prometheus()
    return Response(content=payload, media_type="text/plain; version=0.0.4; charset=utf-8")

