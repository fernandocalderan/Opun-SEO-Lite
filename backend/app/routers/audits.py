from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.db.models.audit import Audit, AuditResult, AuditStatus
from app.db.models.project import Project
from app.schemas.audits import (
    AuditStatusOut,
    CreateAuditIn,
    CreateAuditOut,
    HistoryItem,
    HistoryOut,
    PerformanceOut,
    PerformancePoint,
    QueueItem,
    QueueOut,
    AuditSummaryOut,
)
from app.workers.tasks import run_audit_task


router = APIRouter(prefix="/v1/audits", tags=["audits"])


@router.post("/")
@router.post("")
def create_audit(payload: CreateAuditIn, db: Session = Depends(get_db)) -> CreateAuditOut:
    audit = Audit(
        id=str(uuid4()),
        url=payload.url,
        keywords=payload.keywords or [],
        scan_depth=payload.scanDepth,
        include_serp=bool(payload.includeSerp) if payload.includeSerp is not None else True,
        include_reputation=bool(payload.includeReputation) if payload.includeReputation is not None else True,
        include_technical=bool(payload.includeTechnical) if payload.includeTechnical is not None else True,
        status=AuditStatus.pending,
    )
    # Asociar a proyecto por nombre si viene (best-effort)
    if payload.projectName:
        p = db.execute(select(Project).where(Project.name == payload.projectName)).scalars().first()
        if p:
            audit.project_id = p.id

    db.add(audit)
    db.commit()
    db.refresh(audit)

    # Encolar tarea asíncrona
    run_audit_task.delay(audit.id)
    return CreateAuditOut(id=audit.id)


@router.get("/{audit_id}/status")
def get_audit_status(audit_id: str, db: Session = Depends(get_db)) -> AuditStatusOut:
    audit = db.get(Audit, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return AuditStatusOut(id=audit.id, status=audit.status.value)


@router.get("/{audit_id}/result")
def get_audit_result(audit_id: str, db: Session = Depends(get_db)):
    audit = db.get(Audit, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    if audit.status in (AuditStatus.pending, AuditStatus.running) or not audit.result:
        # 202 Accepted para indicar en proceso
        from fastapi import Response

        return Response(status_code=202)
    return audit.result.payload


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)) -> AuditSummaryOut:
    # tomar último resultado
    result = (
        db.execute(select(AuditResult).order_by(desc(AuditResult.created_at))).scalars().first()
    )
    if not result:
        return AuditSummaryOut(
            overall_score=0,
            critical_issues=0,
            warnings=0,
            opportunities=0,
            last_run=datetime.now(timezone.utc).isoformat(),
        )
    return AuditSummaryOut(
        overall_score=result.overall_score,
        critical_issues=result.critical_issues,
        warnings=result.warnings,
        opportunities=result.opportunities,
        last_run=(result.created_at or datetime.now(timezone.utc)).isoformat(),
    )


@router.get("/queue")
def get_queue(
    limit: int = Query(10, ge=1, le=100),
    cursor: str | None = None,
    db: Session = Depends(get_db),
) -> QueueOut:
    q = db.execute(
        select(Audit).order_by(desc(Audit.created_at)).limit(limit)
    ).scalars().all()
    items: list[QueueItem] = []
    for a in q:
        proj = db.get(Project, a.project_id) if a.project_id else None
        eta = None
        if a.status == AuditStatus.running and a.started_at:
            # estimación fija de 8 minutos total; ETA residual aproximada
            elapsed = int((datetime.now(timezone.utc) - a.started_at).total_seconds())
            eta = max(0, 8 * 60 - elapsed)
        items.append(
            QueueItem(
                id=a.id,
                project=proj.name if proj else (a.url or "Proyecto"),
                type=a.type,
                status=a.status.value,
                started_at=(a.started_at.isoformat() if a.started_at else None),
                eta_seconds=eta,
            )
        )
    return QueueOut(items=items, next_cursor=None, total=len(items))


@router.get("/pending")
def get_pending(db: Session = Depends(get_db)):
    q = db.execute(select(Audit).where(Audit.status == AuditStatus.pending)).scalars().all()
    items = []
    for a in q:
        proj = db.get(Project, a.project_id) if a.project_id else None
        items.append(
            {
                "id": a.id,
                "project": proj.name if proj else (a.url or "Proyecto"),
                "type": a.type,
                "status": a.status.value,
                "started_at": None,
                "eta_seconds": None,
            }
        )
    return {"items": items, "count": len(items)}


@router.get("/history")
def get_history(
    limit: int = Query(5, ge=1, le=100),
    cursor: str | None = None,
    db: Session = Depends(get_db),
) -> HistoryOut:
    q = (
        db.execute(
            select(Audit).where(Audit.status == AuditStatus.completed).order_by(desc(Audit.finished_at)).limit(limit)
        )
        .scalars()
        .all()
    )
    items: list[HistoryItem] = []
    for a in q:
        proj = db.get(Project, a.project_id) if a.project_id else None
        score = a.result.overall_score if a.result else 0
        crit = a.result.critical_issues if a.result else 0
        items.append(
            HistoryItem(
                id=a.id,
                project=proj.name if proj else (a.url or "Proyecto"),
                completed_at=(a.finished_at or a.created_at).isoformat(),
                score=score,
                critical_issues=crit,
                owner="SEO Ops",
            )
        )
    return HistoryOut(items=items, next_cursor=None, total=len(items))


@router.get("/performance")
def get_performance(db: Session = Depends(get_db)) -> PerformanceOut:
    results = (
        db.execute(
            select(Audit, AuditResult)
            .join(AuditResult, Audit.id == AuditResult.audit_id)
            .where(Audit.status == AuditStatus.completed)
            .order_by(desc(Audit.finished_at))
        )
        .all()
    )
    points: list[PerformancePoint] = []
    durations: list[int] = []
    scores: list[int] = []
    for a, r in results:
        duration = 0
        if a.started_at and a.finished_at:
            duration = int((a.finished_at - a.started_at).total_seconds())
        else:
            duration = 8 * 60
        durations.append(duration)
        scores.append(r.overall_score)
        proj = db.get(Project, a.project_id) if a.project_id else None
        points.append(
            PerformancePoint(
                id=a.id,
                project=proj.name if proj else (a.url or "Proyecto"),
                completed_at=(a.finished_at or a.created_at).isoformat(),
                score=r.overall_score,
                critical_issues=r.critical_issues,
                duration_seconds=duration,
            )
        )

    if points:
        avg_score = sum(scores) / len(scores)
        avg_duration = sum(durations) / len(durations)
        max_duration = max(durations)
    else:
        avg_score = 0.0
        avg_duration = 0.0
        max_duration = 0

    # distribución simple
    buckets = [
        {"label": "<5m", "min": 0, "max": 300},
        {"label": "5-10m", "min": 300, "max": 600},
        {"label": "10-15m", "min": 600, "max": 900},
        {"label": ">15m", "min": 900, "max": 999999},
    ]
    dist = []
    for b in buckets:
        dist.append({"label": b["label"], "count": len([d for d in durations if b["min"] <= d < b["max"]])})

    return PerformanceOut(
        points=points,
        aggregates={
            "average_score": avg_score,
            "average_duration_seconds": avg_duration,
            "max_duration_seconds": max_duration,
            "sample_size": len(points),
            "duration_distribution": dist,
        },
    )
