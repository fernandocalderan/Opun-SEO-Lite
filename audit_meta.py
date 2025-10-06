from typing import Dict, List, Tuple, Optional
import re
from urllib.parse import urlparse

from utils import (
    fetch_url,
    get_html_soup,
    parse_meta_tags,
    header_value,
)

# ---------------------------
# Utilidades
# ---------------------------
def _length_status(text: str, good_range: Tuple[int, int], warn_range: Tuple[int, int]) -> str:
    n = len((text or "").strip())
    gmin, gmax = good_range
    wmin, wmax = warn_range
    if gmin <= n <= gmax:
        return "green"
    if wmin <= n <= wmax:
        return "amber"
    return "red"

def _bool_status(ok: bool, warn: bool = False) -> str:
    if ok:
        return "green"
    return "amber" if warn else "red"

def _abs_url(u: str) -> bool:
    return bool(re.match(r"^https?://", (u or "").strip(), re.I))

def _contains(text: str, kw: str) -> bool:
    if not text or not kw:
        return False
    return kw.lower() in (text or "").lower()

def _match_type(text: str, kw: str) -> str:
    """Devuelve exact|partial|none (exact coincide por palabra/frase completa con límites)."""
    if not text or not kw:
        return "none"
    t = text.lower()
    k = kw.lower().strip()
    # Exact (palabra/frase con límites aproximados)
    # Permite espacios dentro de la frase pero respeta delimitadores alrededor
    # Ej: kw="abogado laboral" → busca límites no alfanuméricos
    pat_exact = r"(?<![0-9a-záéíóúñü])" + re.escape(k) + r"(?![0-9a-záéíóúñü])"
    if re.search(pat_exact, t):
        return "exact"
    # Parcial
    return "partial" if k in t else "none"

def _tokenize(text: str) -> List[str]:
    return re.findall(r"[0-9a-záéíóúñü]+", (text or "").lower())

def _density_simple(corpus: str, kw: str) -> float:
    """Densidad simple: apariciones / nº de palabras (0..1). Corpus = title+desc+H1+H2."""
    toks = _tokenize(corpus)
    if not toks:
        return 0.0
    # Contamos ocurrencias del término completo (no por palabras sueltas)
    occurrences = len(re.findall(re.escape(kw.lower()), " ".join(toks)))
    return occurrences / max(1, len(toks))

def _slug_from_url(url: str) -> str:
    try:
        path = urlparse(url).path or ""
        # último segmento significativo
        slug = path.rstrip("/").split("/")[-1]
        return slug or path
    except Exception:
        return ""

def _score_from_matches(mt_title: str, mt_desc: str, mt_h1: str, mt_h2_best: str, mt_slug: str) -> int:
    """
    Ponderación:
      title 40, description 25, h1 20, url_slug 10, h2 5
      exact = 100%, partial = 60%, none = 0%
    """
    def pts(mt: str, weight: int) -> float:
        return {"exact": 1.0, "partial": 0.6, "none": 0.0}.get(mt, 0.0) * weight
    score = (
        pts(mt_title, 40) +
        pts(mt_desc, 25) +
        pts(mt_h1, 20) +
        pts(mt_slug, 10) +
        pts(mt_h2_best, 5)
    )
    return int(round(score))

def _status_from_density(d: float) -> str:
    """
    Heurística sencilla:
      <= 0.015 → green (~ <=1.5%)
      0.015–0.025 → amber (~1.5–2.5%)
      > 0.025 → red (>2.5%)
    """
    if d <= 0.015:
        return "green"
    if d <= 0.025:
        return "amber"
    return "red"

def _kw_relevance_block(url: str, meta: dict, keywords: Optional[List[str]]) -> dict:
    """
    Bloque enriquecido y compatible:
    - Conserva {"keywords": [...], "score": total} (legacy)
    - Añade:
      {
        "by_keyword": {
          "kw": {
            "title": {"present": bool, "match": "exact|partial|none"},
            "meta_description": {...},
            "h1": {"present": bool, "match": ..., "count": n},
            "h2": {"present": bool, "match": ..., "count": n},
            "url_slug": {"present": bool, "match": ...},
            "density": {"value": float, "status": "green|amber|red"},
            "score": 0..100,
            "suggestions": [...]
          }, ...
        },
        "overall_score": 0..100
      }
    """
    legacy_items = []
    legacy_total = 0
    by_kw: Dict[str, dict] = {}

    if not keywords:
        return {
            "keywords": [],
            "score": 0,
            "by_keyword": {},
            "overall_score": 0
        }

    title = meta.get("title") or ""
    description = meta.get("description") or ""
    headings = meta.get("headings", {}) or {}
    h1s = headings.get("h1", []) or []
    h2s = headings.get("h2", []) or []
    slug = _slug_from_url(meta.get("url") or url)

    # Corpus para densidad (simple)
    corpus = " ".join([title, description] + h1s + h2s).strip()

    per_kw_scores: List[int] = []

    for kw in keywords:
        # Presencias (legacy boolean)
        r_title = _contains(title, kw)
        r_desc  = _contains(description, kw)
        r_h1    = any(_contains(x, kw) for x in h1s)
        r_h2    = any(_contains(x, kw) for x in h2s)

        # Tipos de match enriquecidos
        mt_title = _match_type(title, kw)
        mt_desc  = _match_type(description, kw)
        mt_h1s   = [_match_type(x, kw) for x in h1s]
        mt_h2s   = [_match_type(x, kw) for x in h2s]
        mt_h1_best = "none" if not mt_h1s else sorted(mt_h1s, key=lambda m: {"exact":0,"partial":1,"none":2}[m])[0]
        mt_h2_best = "none" if not mt_h2s else sorted(mt_h2s, key=lambda m: {"exact":0,"partial":1,"none":2}[m])[0]
        mt_slug  = _match_type(slug.replace("-", " "), kw)

        # Densidad naive
        dens = _density_simple(corpus, kw)
        dens_status = _status_from_density(dens)

        # Score ponderado 0..100
        score = _score_from_matches(mt_title, mt_desc, mt_h1_best, mt_h2_best, mt_slug)
        per_kw_scores.append(score)

        # Sugerencias por KW
        sug: List[Dict] = []
        if mt_title == "none":
            sug.append({
                "prioridad": "Alta",
                "categoria": "On-Page",
                "tarea": f"Incluir la keyword en <title>: «{kw}».",
                "impacto": "Alto",
                "esfuerzo": "Bajo",
                "nota": "Usa una redacción natural, con marca si procede."
            })
        if mt_desc == "none":
            sug.append({
                "prioridad": "Media",
                "categoria": "On-Page",
                "tarea": f"Incluir la keyword en meta description: «{kw}».",
                "impacto": "Medio",
                "esfuerzo": "Bajo",
                "nota": "Propuesta de valor + CTA, evita keyword stuffing."
            })
        if mt_h1_best == "none":
            sug.append({
                "prioridad": "Media",
                "categoria": "On-Page",
                "tarea": f"Alinear el H1 con la keyword objetivo: «{kw}».",
                "impacto": "Medio",
                "esfuerzo": "Bajo",
                "nota": "No dupliques literalmente el <title>; sé coherente."
            })
        if mt_h2_best == "none":
            sug.append({
                "prioridad": "Baja",
                "categoria": "On-Page",
                "tarea": f"Incluir «{kw}» en algún H2 relacionado.",
                "impacto": "Bajo",
                "esfuerzo": "Bajo",
                "nota": "Refuerzo semántico natural."
            })
        if dens_status == "red":
            sug.append({
                "prioridad": "Alta",
                "categoria": "On-Page",
                "tarea": f"Reducir sobre-optimización de «{kw}» (posible stuffing).",
                "impacto": "Alto",
                "esfuerzo": "Bajo",
                "nota": "Baja densidad por debajo de ~2.5% y varía el lenguaje."
            })

        # Estructura enriquecida por KW
        by_kw[kw] = {
            "title": {"present": r_title, "match": mt_title},
            "meta_description": {"present": r_desc, "match": mt_desc},
            "h1": {"present": r_h1, "match": mt_h1_best, "count": sum(m != "none" for m in mt_h1s)},
            "h2": {"present": r_h2, "match": mt_h2_best, "count": sum(m != "none" for m in mt_h2s)},
            "url_slug": {"present": mt_slug != "none", "match": mt_slug},
            "density": {"value": round(dens, 4), "status": dens_status},
            "score": score,
            "suggestions": sug,
        }

        # Estructura legacy por compatibilidad
        legacy_score = (3 if r_title else 0) + (2 if r_desc else 0) + (2 if r_h1 else 0) + (1 if r_h2 else 0)
        legacy_total += legacy_score
        legacy_items.append({
            "kw": kw,
            "in_title": r_title,
            "in_description": r_desc,
            "in_h1": r_h1,
            "in_h2": r_h2,
            "kw_score": legacy_score
        })

    overall_score = int(round(sum(per_kw_scores) / max(1, len(per_kw_scores))))

    return {
        # Compatibilidad con renderizadores antiguos
        "keywords": legacy_items,
        "score": legacy_total,
        # Bloque enriquecido
        "by_keyword": by_kw,
        "overall_score": overall_score,
    }

# ---------------------------
# Auditoría principal
# ---------------------------
def audit_metadata(url: str, keywords: Optional[List[str]] = None) -> Dict:
    """
    Auditoría de Metadatos con relevancia por keywords opcionales.
    Retorna estructura con:
      - semáforos title/description/robots/canonical
      - headings_top
      - keyword_relevance (enriquecido y compatible)
      - suggestions
    """
    base: Dict = {
        "status": "ok",
        "error": None,
        "url": url,
        "title": {"value": "", "len": 0, "status": "red"},
        "description": {"value": "", "len": 0, "status": "red"},
        "robots_meta": {"value": "", "status": "red"},
        "canonical": {"value": "", "absolute": False, "status": "red"},
        "http_status": None,
        "content_type": "",
        "headings_top": {"h1": [], "h2": [], "h3": []},
        "keyword_relevance": {"keywords": [], "score": 0, "by_keyword": {}, "overall_score": 0},
        "suggestions": [],
    }

    try:
        resp, _, _ = fetch_url(url)
    except Exception as e:
        base["status"] = "error"
        base["error"] = f"{e}"
        base["suggestions"] = [{
            "prioridad": "Alta",
            "categoria": "Conectividad",
            "tarea": "Corregir la configuración TLS/SSL o disponibilidad del sitio para permitir la auditoría.",
            "impacto": "Alto",
            "esfuerzo": "Medio",
            "nota": "Error de red al recuperar la página (TLS/SSL o conexión)."
        }]
        return base

    base["http_status"] = resp.status_code
    base["content_type"] = header_value(resp.headers, "content-type")

    soup = get_html_soup(resp)
    if soup is None:
        base["suggestions"] = [{
            "prioridad": "Media",
            "categoria": "Contenido",
            "tarea": "Servir contenido HTML para permitir metadatos y SEO on-page.",
            "impacto": "Medio",
            "esfuerzo": "Medio",
            "nota": f"Content-Type: {base['content_type'] or 'desconocido'}"
        }]
        return base

    meta = parse_meta_tags(soup)
    # Adjunta URL para el cálculo de slug en _kw_relevance_block
    meta["url"] = url

    title = meta.get("title", "")
    description = meta.get("description", "")
    robots_meta = (meta.get("robots") or "").lower()
    canonical = meta.get("canonical", "")

    title_status = _length_status(title, good_range=(30, 60), warn_range=(20, 70))
    desc_status  = _length_status(description, good_range=(70, 160), warn_range=(50, 180))

    robots_flags = set(re.split(r"\s*,\s*", robots_meta)) if robots_meta else set()
    robots_ok = (not robots_flags) or (("index" in robots_flags or "all" in robots_flags) and ("nofollow" not in robots_flags))
    robots_status = "green" if robots_ok else "red"

    canonical_abs = _abs_url(canonical)
    canonical_status = _bool_status(canonical_abs)

    kw_rel = _kw_relevance_block(url, meta, keywords)

    result = {
        **base,
        "status": "ok",
        "error": None,
        "title": {"value": title, "len": len(title or ""), "status": title_status},
        "description": {"value": description, "len": len(description or ""), "status": desc_status},
        "robots_meta": {"value": robots_meta, "status": robots_status},
        "canonical": {"value": canonical, "absolute": canonical_abs, "status": canonical_status},
        "headings_top": meta.get("headings", {"h1": [], "h2": [], "h3": []}),
        "keyword_relevance": kw_rel,
        "suggestions": [],
    }

    suggestions: List[Dict] = []

    if title_status != "green":
        suggestions.append({
            "prioridad": "Alta",
            "categoria": "On-Page",
            "tarea": "Optimizar <title> a 30–60 caracteres, incluyendo marca y palabra clave principal.",
            "impacto": "Alto",
            "esfuerzo": "Bajo",
            "nota": f"Longitud actual: {len(title)}"
        })

    if desc_status != "green":
        suggestions.append({
            "prioridad": "Media",
            "categoria": "On-Page",
            "tarea": "Ajustar meta description a 70–160 caracteres con propuesta de valor y CTA.",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": f"Longitud actual: {len(description)}"
        })

    if not canonical:
        suggestions.append({
            "prioridad": "Media",
            "categoria": "On-Page",
            "tarea": "Añadir etiqueta canonical absoluta apuntando a la URL canónica.",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": "No se detectó <link rel='canonical'>"
        })
    elif not canonical_abs:
        suggestions.append({
            "prioridad": "Media",
            "categoria": "On-Page",
            "tarea": "Convertir canonical a URL absoluta (https://...).",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": f"Canonical actual: {canonical}"
        })

    if robots_meta and robots_status == "red":
        suggestions.append({
            "prioridad": "Alta",
            "categoria": "Indexabilidad",
            "tarea": "Revisar meta robots (evitar noindex/nofollow en producción).",
            "impacto": "Alto",
            "esfuerzo": "Bajo",
            "nota": f"robots meta: {robots_meta}"
        })

    # Sugerencias guiadas por keywords (enriquecidas)
    if keywords:
        headings = meta.get("headings", {})
        h1s = headings.get("h1", []) or []
        h2s = headings.get("h2", []) or []
        for kw in keywords:
            mt_title = _match_type(title, kw)
            mt_desc  = _match_type(description, kw)
            mt_h1    = "none" if not h1s else sorted([_match_type(x, kw) for x in h1s], key=lambda m: {"exact":0,"partial":1,"none":2}[m])[0]
            mt_h2    = "none" if not h2s else sorted([_match_type(x, kw) for x in h2s], key=lambda m: {"exact":0,"partial":1,"none":2}[m])[0]

            if mt_title == "none":
                suggestions.append({
                    "prioridad": "Alta",
                    "categoria": "On-Page",
                    "tarea": f"Incluir la keyword objetivo en <title>: «{kw}».",
                    "impacto": "Alto",
                    "esfuerzo": "Bajo",
                    "nota": "Natural y sin keyword stuffing."
                })
            if mt_desc == "none":
                suggestions.append({
                    "prioridad": "Media",
                    "categoria": "On-Page",
                    "tarea": f"Incluir la keyword en meta description: «{kw}».",
                    "impacto": "Medio",
                    "esfuerzo": "Bajo",
                    "nota": "Propuesta de valor + CTA."
                })
            if mt_h1 == "none":
                suggestions.append({
                    "prioridad": "Media",
                    "categoria": "On-Page",
                    "tarea": f"Alinear el H1 con la keyword: «{kw}».",
                    "impacto": "Medio",
                    "esfuerzo": "Bajo",
                    "nota": "Evita duplicar el title, pero sé coherente."
                })
            if mt_h2 == "none":
                suggestions.append({
                    "prioridad": "Baja",
                    "categoria": "On-Page",
                    "tarea": f"Refuerza semántica incluyendo «{kw}» en algún H2.",
                    "impacto": "Bajo",
                    "esfuerzo": "Bajo",
                    "nota": "Úsalo en subtítulos relevantes."
                })

        # Si hay stuffing global para alguna KW (densidad roja), añade una sugerencia general
        if any(v.get("density", {}).get("status") == "red" for v in kw_rel.get("by_keyword", {}).values()):
            suggestions.append({
                "prioridad": "Alta",
                "categoria": "On-Page",
                "tarea": "Reducir sobre-optimización de keywords (densidad elevada).",
                "impacto": "Alto",
                "esfuerzo": "Bajo",
                "nota": "Diversifica términos, usa sinónimos y variaciones semánticas."
            })

    result["suggestions"] = suggestions
    return result


def audit_headings_detail(url: str) -> Dict:
    """
    Devuelve un detalle de metadatos y encabezados para tabla (sin lógica de keywords).
    """
    base = {
        "status": "ok",
        "error": None,
        "url": url,
        "title": "",
        "meta_description": "",
        "robots_meta": "",
        "canonical": "",
        "h1": [],
        "h2": [],
        "h3": [],
    }

    try:
        resp, _, _ = fetch_url(url)
    except Exception as e:
        base["status"] = "error"
        base["error"] = f"{e}"
        return base

    soup = get_html_soup(resp)
    if soup is None:
        return base

    meta = parse_meta_tags(soup)

    return {
        **base,
        "title": meta.get("title", ""),
        "meta_description": meta.get("description", ""),
        "robots_meta": (meta.get("robots") or ""),
        "canonical": meta.get("canonical", ""),
        "h1": meta.get("headings", {}).get("h1", []),
        "h2": meta.get("headings", {}).get("h2", []),
        "h3": meta.get("headings", {}).get("h3", []),
    }
