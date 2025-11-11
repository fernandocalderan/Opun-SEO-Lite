from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.services.serpapi_svc import serp_ranks


router = APIRouter(prefix="/v1/reputation", tags=["reputation"])


@router.get("/summary")
def summary() -> List[dict]:
    # KpiSummaryItem[]
    return [
        {
            "label": "Reputation Score",
            "value": "74 / 100",
            "delta": "-5 semana",
            "status": "watch",
            "description": "Descenso por menciones negativas en foros especializados.",
        },
        {
            "label": "Alertas activas",
            "value": "6",
            "delta": "3 criticas",
            "status": "risk",
            "description": "Dos hilos en Reddit, una review G2 y tres post sociales pendientes.",
        },
        {
            "label": "Share de voz positivo",
            "value": "42%",
            "delta": "+8 vs. mes anterior",
            "status": "good",
            "description": "Campaña de PR generó 3 publicaciones con link a landing principal.",
        },
    ]


@router.get("/timeline")
def timeline() -> List[dict]:
    # SentimentTimelinePoint[]
    return [
        {"date": "Oct 21", "score": 68, "negative": 4, "positive": 12},
        {"date": "Oct 22", "score": 71, "negative": 3, "positive": 15},
        {"date": "Oct 23", "score": 66, "negative": 7, "positive": 11},
        {"date": "Oct 24", "score": 74, "negative": 2, "positive": 17},
        {"date": "Oct 25", "score": 70, "negative": 5, "positive": 14},
        {"date": "Oct 26", "score": 64, "negative": 8, "positive": 9},
        {"date": "Oct 27", "score": 72, "negative": 3, "positive": 19},
    ]


@router.get("/channels")
def channels() -> List[dict]:
    # ChannelBreakdownItem[]
    return [
        {"channel": "SERP Top Stories", "exposure": "Alta", "sentiment": "positivo", "share": "34%"},
        {"channel": "Redes sociales", "exposure": "Media", "sentiment": "negativo", "share": "27%"},
        {"channel": "Foros especializados", "exposure": "Alta", "sentiment": "negativo", "share": "21%"},
        {"channel": "Reviews SaaS", "exposure": "Media", "sentiment": "neutral", "share": "18%"},
    ]


@router.get("/mentions")
def mentions() -> List[dict]:
    # ReputationMention[] con published_at en ISO
    now = datetime.now(timezone.utc)
    def hours_ago(h: int):
        return (now).isoformat()

    return [
        {
            "id": "mention-1",
            "source": "Reddit / r/marketingops",
            "sentiment": "negativo",
            "snippet": "El soporte tarda en responder tickets enterprise, deberian ampliar SLA.",
            "published_at": now.isoformat(),
            "reach": "14k",
            "action": "Coordinar respuesta con PR",
        },
        {
            "id": "mention-2",
            "source": "YouTube / Review canal TechSEO",
            "sentiment": "positivo",
            "snippet": "La automatizacion de auditorias es sobresaliente, agiliza la propuesta a clientes.",
            "published_at": now.isoformat(),
            "reach": "22k",
            "action": "Compartir en newsletter y redes",
        },
        {
            "id": "mention-3",
            "source": "SERP / Blog industry",
            "sentiment": "neutral",
            "snippet": "Comparativa de plataformas ORM, Opun destaca por reportes pero faltan casos B2C.",
            "published_at": now.isoformat(),
            "reach": "9k",
            "action": "Publicar caso de exito orientado a B2C",
        },
    ]


@router.get("/ranks")
def ranks(
    domain: str = Query(..., description="Dominio o URL base"),
    kw: list[str] = Query([], description="Palabra clave, múltiple"),
    db: Session = Depends(get_db),
):
    if not domain or not kw:
        raise HTTPException(status_code=400, detail="domain y kw son requeridos")
    items = serp_ranks(db, domain=domain, keywords=kw)
    # convertir al formato que espera el frontend { keyword, status, position, found_url }
    out = []
    for it in items:
        out.append(
            {
                "keyword": it["keyword"],
                "status": "found" if (it["position"] or 0) > 0 else "not_found",
                "position": it["position"],
                "found_url": it["found_url"],
            }
        )
    return out

