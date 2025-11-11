from __future__ import annotations

import logging
from typing import Any


_logger = logging.getLogger("opun.metrics")

# Simple in-process registry (API process only)
_REGISTRY: dict[str, float] = {
    "audits_created_total": 0.0,
    "audits_completed_total": 0.0,
    "audits_failed_total": 0.0,
    "audits_duration_seconds_sum": 0.0,
    "audits_duration_seconds_count": 0.0,
}


def metric(name: str, value: float = 1.0, **labels: Any) -> None:
    """Emit a simple counter/timer metric as a structured log and update registry.

    Known names:
    - audits.created -> audits_created_total
    - audits.completed -> audits_completed_total
    - audits.failed -> audits_failed_total
    - audits.duration_seconds -> audits_duration_seconds_sum/count
    """
    try:
        _logger.info("metric", extra={"metric": name, "value": value, **labels})
    except Exception:
        # Never crash on metrics
        pass

    try:
        if name == "audits.created":
            _REGISTRY["audits_created_total"] += value
        elif name == "audits.completed":
            _REGISTRY["audits_completed_total"] += value
        elif name == "audits.failed":
            _REGISTRY["audits_failed_total"] += value
        elif name == "audits.duration_seconds":
            _REGISTRY["audits_duration_seconds_sum"] += value
            _REGISTRY["audits_duration_seconds_count"] += 1
    except Exception:
        pass


def render_prometheus() -> str:
    lines: list[str] = []
    # counters
    lines.append("# TYPE audits_created_total counter")
    lines.append(f"audits_created_total {_REGISTRY['audits_created_total']:.0f}")
    lines.append("# TYPE audits_completed_total counter")
    lines.append(f"audits_completed_total {_REGISTRY['audits_completed_total']:.0f}")
    lines.append("# TYPE audits_failed_total counter")
    lines.append(f"audits_failed_total {_REGISTRY['audits_failed_total']:.0f}")
    # summary-like for durations
    lines.append("# TYPE audits_duration_seconds summary")
    lines.append(f"audits_duration_seconds_sum {_REGISTRY['audits_duration_seconds_sum']:.6f}")
    lines.append(f"audits_duration_seconds_count {_REGISTRY['audits_duration_seconds_count']:.0f}")
    return "\n".join(lines) + "\n"
