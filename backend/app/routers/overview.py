from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.db.models.audit import Audit, AuditResult, AuditStatus


router = APIRouter(tags=["overview"])


@router.get("/v1/overview")
def get_overview(request: Request, db: Session = Depends(get_db)) -> dict:
    """Basic aggregated dataset for the Overview screen.
    - KPIs: SEO Health (last result), Completed (7d), Queue size now
    - Alerts/Insights: minimal placeholders from last payload suggestions
    - Narrative: simple headline + summary
    """
    req_id = getattr(request.state, "request_id", None)

    # last audit result
    last_result = (
        db.execute(select(AuditResult).order_by(desc(AuditResult.created_at))).scalars().first()
    )
    last_score = int(last_result.overall_score) if last_result else 0
    last_finished_at = None
    if last_result:
        last_audit = db.get(Audit, last_result.audit_id)
        last_finished_at = last_audit.finished_at if last_audit else last_result.created_at

    # counts
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    one_day_ago = now - timedelta(days=1)

    completed_7d = (
        db.execute(
            select(func.count(Audit.id)).where(
                Audit.status == AuditStatus.completed, Audit.finished_at >= seven_days_ago
            )
        )
        .scalars()
        .first()
        or 0
    )
    completed_1d = (
        db.execute(
            select(func.count(Audit.id)).where(
                Audit.status == AuditStatus.completed, Audit.finished_at >= one_day_ago
            )
        )
        .scalars()
        .first()
        or 0
    )
    queue_now = (
        db.execute(
            select(func.count(Audit.id)).where(Audit.status.in_([AuditStatus.pending, AuditStatus.running]))
        )
        .scalars()
        .first()
        or 0
    )

    def kpi_status(score: int) -> str:
        if score >= 80:
            return "good"
        if score >= 60:
            return "watch"
        return "risk"

    kpis = [
        {
            "label": "SEO Health",
            "value": f"{last_score} / 100",
            "delta": "vs. ultimo run",
            "status": kpi_status(last_score),
            "description": "Snapshot del ultimo resultado de auditoria.",
        },
        {
            "label": "Auditorias completadas (7d)",
            "value": str(int(completed_7d)),
            "delta": f"{int(completed_1d)} ultimas 24h",
            "status": "good" if completed_7d else "watch",
            "description": "Ejecuciones finalizadas en la ultima semana.",
        },
        {
            "label": "En cola ahora",
            "value": str(int(queue_now)),
            "delta": "—",
            "status": "watch" if queue_now <= 3 else "risk",
            "description": "Auditorias pendientes o en ejecucion.",
        },
    ]

    # Insights from last payload suggestions, if present
    insights: list[dict] = []
    if last_result and isinstance(last_result.payload, dict):
        def _map_suggestion(s: dict) -> dict:
            pr = (s.get("prioridad") or s.get("priority") or "").lower()
            sev = "low"
            if pr.startswith("alta") or pr.startswith("high"):
                sev = "high"
            elif pr.startswith("media") or pr.startswith("medium"):
                sev = "medium"
            title = s.get("tarea") or s.get("task") or "Mejora sugerida"
            context = s.get("categoria") or s.get("category") or "General"
            rec = s.get("nota") or s.get("recommendation") or "Aplicar en el proximo sprint."
            return {"title": title, "context": context, "recommendation": rec, "severity": sev, "source": "audit"}

        for section_key in ("seo_meta", "crawl_indexability", "performance", "social"):
            sec = last_result.payload.get(section_key) or {}
            for s in sec.get("suggestions", [])[:3]:
                try:
                    insights.append(_map_suggestion(s))
                except Exception:
                    continue

    # Alerts placeholder (empty for now)
    alerts: list[dict] = []

    narrative = {
        "headline": "Estrategia en progreso",
        "summary": (
            f"Ultimo run: {last_finished_at.isoformat() if last_finished_at else '—'}. "
            f"Score general {last_score}/100. En cola {queue_now}."
        ),
        "updated_at": (last_finished_at or now).isoformat(),
    }

    # Best-effort structured log
    try:
        import logging

        logging.getLogger("opun.api").info(
            "overview dataset built",
            extra={
                "request_id": req_id,
                "last_score": last_score,
                "completed_7d": int(completed_7d),
                "queue_now": int(queue_now),
            },
        )
    except Exception:
        pass

    return {"kpis": kpis, "alerts": alerts, "insights": insights, "narrative": narrative}

