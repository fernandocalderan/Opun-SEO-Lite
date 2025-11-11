from celery import Celery
from app.core.config import get_settings
from app.core.logging import configure_json_logging


settings = get_settings()
configure_json_logging(settings.log_level)

celery = Celery(
    "opun",
    broker=settings.redis_url or "redis://redis:6379/0",
    backend=settings.redis_url or "redis://redis:6379/0",
)

celery.conf.task_default_queue = "celery"
celery.conf.timezone = "UTC"
celery.conf.beat_schedule = {
    # ejecuciones periódicas del scheduler de monitoreo
    "enqueue-due-audits-every-minute": {
        "task": "opun.enqueue_due_audits",
        "schedule": 60.0,
    }
}

# Ensure tasks are registered
try:
    from app.workers import tasks as _tasks  # noqa: F401
except Exception:
    pass


@celery.task(name="opun.ping")
def ping() -> str:
    return "pong"
