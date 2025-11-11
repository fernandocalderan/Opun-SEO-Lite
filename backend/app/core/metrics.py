from __future__ import annotations

import logging
from typing import Any


_logger = logging.getLogger("opun.metrics")


def metric(name: str, value: float = 1.0, **labels: Any) -> None:
    """Emit a simple counter/timer metric as a structured log.

    Example: metric("audits.created", 1, source="api")
    """
    try:
        _logger.info("metric", extra={"metric": name, "value": value, **labels})
    except Exception:
        # Never crash on metrics
        pass

