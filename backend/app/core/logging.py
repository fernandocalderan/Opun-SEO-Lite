from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:  # type: ignore[override]
        payload: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "logger": record.name,
            "message": record.getMessage(),
        }
        # merge extras if present
        for key, value in record.__dict__.items():
            if key in (
                "args",
                "asctime",
                "created",
                "exc_info",
                "exc_text",
                "filename",
                "funcName",
                "levelname",
                "levelno",
                "lineno",
                "module",
                "msecs",
                "message",
                "msg",
                "name",
                "pathname",
                "process",
                "processName",
                "relativeCreated",
                "stack_info",
                "thread",
                "threadName",
            ):
                continue
            # include simple JSON-serializable extras
            try:
                json.dumps(value)
                payload[key] = value
            except Exception:
                payload[key] = str(value)
        return json.dumps(payload, ensure_ascii=False)


def configure_json_logging(level: str | int | None = None) -> None:
    """Configure root logging with JSON formatter suitable for CloudWatch/ELK."""
    root = logging.getLogger()
    # Avoid duplicate handlers if called multiple times
    if getattr(root, "_opun_json_logging", False):
        return

    # Level
    if isinstance(level, str):
        lvl = getattr(logging, level.upper(), logging.INFO)
    elif isinstance(level, int):
        lvl = level
    else:
        lvl = getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO)

    root.setLevel(lvl)

    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    # Clear default handlers (uvicorn may add its own; we keep root clean here)
    for h in list(root.handlers):
        root.removeHandler(h)
    root.addHandler(handler)

    # mark configured
    setattr(root, "_opun_json_logging", True)

