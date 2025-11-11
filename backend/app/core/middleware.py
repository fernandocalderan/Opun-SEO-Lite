from __future__ import annotations

import uuid
from typing import Callable

from fastapi import Request, Response
import time
import logging


async def request_id_middleware(request: Request, call_next: Callable):
    """Attach a request ID to state and response headers."""
    req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = req_id
    response: Response = await call_next(request)
    response.headers["x-request-id"] = req_id
    return response


async def access_log_middleware(request: Request, call_next: Callable):
    start = time.perf_counter()
    response: Response | None = None
    try:
        response = await call_next(request)
        return response
    finally:
        duration_ms = int((time.perf_counter() - start) * 1000)
        try:
            logger = logging.getLogger("opun.api")
            logger.info(
                "access",
                extra={
                    "request_id": getattr(request.state, "request_id", None),
                    "method": request.method,
                    "path": request.url.path,
                    "status": getattr(response, "status_code", None),
                    "duration_ms": duration_ms,
                },
            )
        except Exception:
            pass
