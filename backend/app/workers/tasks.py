from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.workers.celery_app import celery
from app.db.session import SessionLocal
from app.db.models.audit import Audit, AuditResult, AuditStatus
from app.db.models.project import Project, ScheduleEnum
from app.services.openai_svc import generate_summary_and_suggestions


@celery.task(name="opun.run_audit")
def run_audit_task(audit_id: str) -> None:
    db: Session = SessionLocal()
    try:
        audit = db.get(Audit, audit_id)
        if not audit:
            return
        audit.status = AuditStatus.running
        audit.started_at = datetime.now(timezone.utc)
        db.add(audit)
        db.commit()
        db.refresh(audit)

        # Aquí se ejecutaría el análisis real; por ahora, generamos un resultado determinístico
        payload = build_sample_result(audit.url, audit.keywords or [])

        # Enriquecer con OpenAI si hay clave
        try:
            html, suggestions = generate_summary_and_suggestions(
                url=audit.url, keywords=audit.keywords or [], metrics={}
            )
            if html:
                payload.setdefault("executive_summary", {})["html"] = html
            if suggestions:
                # Insertar en bloque seo_meta.suggestions para que el frontend las capte
                existing = payload.get("seo_meta", {}).get("suggestions") or []
                payload.setdefault("seo_meta", {})["suggestions"] = [*existing, *suggestions]
        except Exception:
            # Ignorar fallo de OpenAI, mantener payload base
            pass

        result = AuditResult(
            audit_id=audit.id,
            payload=payload,
            overall_score=payload.get("scores", {}).get("overall", 80),
            critical_issues=2,
            warnings=4,
            opportunities=6,
        )
        db.add(result)

        audit.status = AuditStatus.completed
        audit.finished_at = datetime.now(timezone.utc)
        db.add(audit)
        # actualizar last_audit_at del proyecto si aplica
        if audit.project_id:
            proj = db.get(Project, audit.project_id)
            if proj:
                proj.last_audit_at = audit.finished_at
                db.add(proj)
        db.commit()
    except Exception:
        db.rollback()
        audit = db.get(Audit, audit_id)
        if audit:
            audit.status = AuditStatus.failed
            db.add(audit)
            db.commit()
    finally:
    db.close()


def build_sample_result(url: str, keywords: list[str]) -> dict:
    # Resultado de ejemplo compatible con el frontend
    kw = keywords[:2] if keywords else ["plataforma seo", "reputacion online"]
    return {
        "executive_summary": {
            "html": f"<p><strong>Resumen:</strong> Se analizó <em>{url}</em>. Salud general adecuada con oportunidades en metaetiquetas y rendimiento.</p>"
        },
        "scores": {"onpage": 85, "indexability": 90, "wpo": 72, "social": 78, "overall": 82},
        "seo_meta": {
            "title": {"value": "Producto X — Plataforma SEO y ORM", "status": "green"},
            "description": {"value": "Suite para visibilidad y reputacion de marca.", "status": "amber"},
            "robots_meta": {"value": "index,follow", "status": "green"},
            "canonical": {"value": url, "status": "green"},
            "headings_top": {"h1": ["Producto X — Inteligencia SEO"], "h2": ["Automatiza auditorias", "Monitoreo reputacional"]},
            "keyword_relevance": {"by_keyword": {kw[0]: {"score": 86}, kw[1]: {"score": 72}}},
            "suggestions": [
                {"prioridad": "Alta", "tarea": "Optimizar meta description", "categoria": "On-page", "impacto": "Alto", "esfuerzo": "Bajo"}
            ],
        },
        "crawl_indexability": {
            "final_status": 200,
            "redirect_chain": [],
            "chain_status": "green",
            "x_robots_tag": "",
            "suggestions": [
                {"prioridad": "Media", "tarea": "Verificar sitemap.xml", "categoria": "Indexabilidad", "impacto": "Medio", "esfuerzo": "Bajo"}
            ],
        },
        "performance": {
            "core_web_vitals": {"lcp_ms": 2900, "cls": 0.06, "inp_ms": 160},
            "assets": {"total_js_bytes": 820000, "total_css_bytes": 180000},
            "suggestions": [
                {"prioridad": "Alta", "tarea": "Dividir bundle JS y lazy-load", "categoria": "Rendimiento", "impacto": "Alto", "esfuerzo": "Medio"}
            ],
        },
        "social": {
            "og": {"title": "Producto X", "description": "Visibilidad y ORM", "image": "https://example.com/og.png"},
            "twitter": {"card": "summary_large_image"},
            "suggestions": [
                {"prioridad": "Media", "tarea": "Unificar OG:title con Title", "categoria": "Social", "impacto": "Medio", "esfuerzo": "Bajo"}
            ],
        },
        "serp": [
            {"keyword": kw[0], "status": "found", "position": 8, "found_url": url},
            {"keyword": kw[1], "status": "found", "position": 12, "found_url": url},
        ],
    }


@celery.task(name="opun.enqueue_due_audits")
def enqueue_due_audits() -> int:
    """Programa auditorías para proyectos con monitoreo activo según su schedule.
    Devuelve la cantidad de auditorías encoladas.
    """
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        enqueued = 0
        projects = db.query(Project).filter(Project.monitoring_enabled.is_(True)).all()
        for p in projects:
            threshold_seconds = _schedule_to_seconds(p.schedule)
            if threshold_seconds is None:
                continue
            last = p.last_audit_at
            should_run = last is None or (now - last).total_seconds() >= threshold_seconds
            if not should_run:
                continue

            audit = Audit(
                id=str(uuid4()),
                project_id=p.id,
                url=p.primary_url,
                keywords=p.keywords or [],
                scan_depth="standard",
                include_serp=True,
                include_reputation=True,
                include_technical=True,
                status=AuditStatus.pending,
                type="Scheduled",
                created_at=now,
            )
            db.add(audit)
            # actualizar last_audit_at al momento de encolar para evitar duplicados
            p.last_audit_at = now
            db.add(p)
            db.commit()
            run_audit_task.delay(audit.id)
            enqueued += 1
        return enqueued
    finally:
        db.close()


def _schedule_to_seconds(s: ScheduleEnum | str | None) -> int | None:
    try:
        val = s.value if isinstance(s, ScheduleEnum) else s
    except Exception:
        val = None
    if val in (None, "none"):
        return None
    if val == "hourly":
        return 60 * 60
    if val == "daily":
        return 24 * 60 * 60
    if val == "weekly":
        return 7 * 24 * 60 * 60
    if val == "monthly":
        return 30 * 24 * 60 * 60
    return None
