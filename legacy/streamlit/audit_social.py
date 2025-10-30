from typing import Dict, List, Optional
import mimetypes
import re

from utils import fetch_url, get_html_soup, parse_og_twitter, absolutize

# ---------------------------
# Helpers
# ---------------------------
def _status(ok: bool, warn: bool = False) -> str:
    if ok:
        return "green"
    return "amber" if warn else "red"

def _is_image_url(url: str) -> bool:
    if not url:
        return False
    guess, _ = mimetypes.guess_type(url)
    return (guess or "").startswith("image/")

def _contains(text: str, kw: str) -> bool:
    if not text or not kw:
        return False
    return kw.lower() in (text or "").lower()

def _match_type(text: str, kw: str) -> str:
    """Devuelve exact|partial|none (exact = frase/palabra con límites aproximados)."""
    if not text or not kw:
        return "none"
    t = (text or "").lower()
    k = (kw or "").lower().strip()
    pat_exact = r"(?<![0-9a-záéíóúñü])" + re.escape(k) + r"(?![0-9a-záéíóúñü])"
    if re.search(pat_exact, t):
        return "exact"
    return "partial" if k in t else "none"

def _pts(mt: str, weight: int) -> float:
    return {"exact": 1.0, "partial": 0.6, "none": 0.0}.get(mt, 0.0) * weight

def _kw_relevance_social_enriched(og: dict, tw: dict, keywords: Optional[List[str]]) -> dict:
    """
    Enriquecido y compatible:
    - legacy: {"keywords":[{"kw":..., "in_og_title":..., ...}], "score": total}
    - nuevo:  {"by_keyword": {kw: {...}}, "overall_score": 0..100}
    Ponderación:
      og:title 35, og:description 25, twitter:title 25, twitter:description 15
    """
    legacy_items: List[dict] = []
    legacy_total = 0
    by_kw: Dict[str, dict] = {}

    if not keywords:
        return {"keywords": [], "score": 0, "by_keyword": {}, "overall_score": 0}

    ogt = og.get("og:title", "") or ""
    ogd = og.get("og:description", "") or ""
    twt = tw.get("twitter:title", "") or ""
    twd = tw.get("twitter:description", "") or ""

    per_scores: List[int] = []

    for kw in keywords:
        # Legacy boolean presence
        in_ogt = _contains(ogt, kw)
        in_ogd = _contains(ogd, kw)
        in_twt = _contains(twt, kw)
        in_twd = _contains(twd, kw)

        legacy_score = (2 if in_ogt else 0) + (1 if in_ogd else 0) + (2 if in_twt else 0) + (1 if in_twd else 0)
        legacy_total += legacy_score
        legacy_items.append({
            "kw": kw,
            "in_og_title": in_ogt,
            "in_og_description": in_ogd,
            "in_tw_title": in_twt,
            "in_tw_description": in_twd,
            "kw_score": legacy_score
        })

        # Match types enriquecidos
        mt_ogt = _match_type(ogt, kw)
        mt_ogd = _match_type(ogd, kw)
        mt_twt = _match_type(twt, kw)
        mt_twd = _match_type(twd, kw)

        score = (
            _pts(mt_ogt, 35) +
            _pts(mt_ogd, 25) +
            _pts(mt_twt, 25) +
            _pts(mt_twd, 15)
        )
        score = int(round(score))
        per_scores.append(score)

        # Sugerencias específicas por KW
        sug: List[Dict] = []
        if mt_ogt == "none":
            sug.append({
                "prioridad": "Media",
                "categoria": "Social",
                "tarea": f"Incluir «{kw}» en og:title de forma natural.",
                "impacto": "Medio",
                "esfuerzo": "Bajo",
                "nota": "Mantén consistencia con <title> SEO."
            })
        if mt_twt == "none":
            sug.append({
                "prioridad": "Baja",
                "categoria": "Social",
                "tarea": f"Incluir «{kw}» en twitter:title si aporta claridad.",
                "impacto": "Bajo",
                "esfuerzo": "Bajo",
                "nota": "Evita sobre-optimización; copy atractivo > keyword pura."
            })
        if mt_ogd == "none" and mt_twd == "none":
            sug.append({
                "prioridad": "Baja",
                "categoria": "Social",
                "tarea": f"Mencionar «{kw}» en og:description o twitter:description si procede.",
                "impacto": "Bajo",
                "esfuerzo": "Bajo",
                "nota": "Enfoca en beneficio/valor para mejorar CTR."
            })

        by_kw[kw] = {
            "og": {
                "title": {"present": in_ogt, "match": mt_ogt},
                "description": {"present": in_ogd, "match": mt_ogd},
            },
            "twitter": {
                "title": {"present": in_twt, "match": mt_twt},
                "description": {"present": in_twd, "match": mt_twd},
            },
            "score": score,
            "suggestions": sug,
        }

    overall_score = int(round(sum(per_scores) / max(1, len(per_scores))))

    return {
        "keywords": legacy_items,
        "score": legacy_total,
        "by_keyword": by_kw,
        "overall_score": overall_score,
    }

# ---------------------------
# Auditoría principal
# ---------------------------
def audit_social(url: str, keywords: Optional[List[str]] = None) -> Dict:
    """
    Checklist Social (OG/Twitter) + relevancia por keywords (opcional).
    """
    base_result = {
        "status": "ok",
        "error": None,
        "url": url,
        "og": {"status": "red"},
        "twitter": {"status": "red"},
        "preview_image": "",
        "keyword_relevance": {"keywords": [], "score": 0, "by_keyword": {}, "overall_score": 0},
        "suggestions": [],
    }

    try:
        resp, _, _ = fetch_url(url)
    except Exception as e:
        base_result["status"] = "error"
        base_result["error"] = f"{e}"
        base_result["suggestions"] = [{
            "prioridad": "Media",
            "categoria": "Social",
            "tarea": "No se pudo recuperar la página para leer etiquetas sociales (OG/Twitter).",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": "El servidor rechazó la conexión TLS/SSL o la cerró de forma inesperada."
        }]
        return base_result

    soup = get_html_soup(resp)
    og, tw = parse_og_twitter(soup)
    root = resp.url or url

    # Normaliza imágenes relativas
    if og.get("og:image") and not str(og["og:image"]).startswith("http"):
        og["og:image"] = absolutize(root, og["og:image"])
    if tw.get("twitter:image") and not str(tw["twitter:image"]).startswith("http"):
        tw["twitter:image"] = absolutize(root, tw["twitter:image"])

    og_ok = bool(og.get("og:title")) and bool(og.get("og:description")) and bool(og.get("og:image"))
    tw_ok = bool(tw.get("twitter:title")) and bool(tw.get("twitter:description")) and bool(tw.get("twitter:image"))
    og_status = _status(og_ok, warn=(bool(og.get("og:title")) or bool(og.get("og:description"))))
    tw_status = _status(tw_ok, warn=(bool(tw.get("twitter:title")) or bool(tw.get("twitter:description"))))

    preview = og.get("og:image") or tw.get("twitter:image") or ""
    img_looks_ok = _is_image_url(preview)

    # Relevancia por keywords (enriquecida y compatible)
    kw_rel = _kw_relevance_social_enriched(og, tw, keywords)

    result = {
        **base_result,
        "status": "ok",
        "error": None,
        "og": {**og, "status": og_status},
        "twitter": {**tw, "status": tw_status},
        "preview_image": preview,
        "keyword_relevance": kw_rel,
        "suggestions": [],
    }

    suggestions: List[Dict] = []

    # OG esenciales
    if og_status != "green":
        missing = [k for k in ["og:title", "og:description", "og:image"] if not og.get(k)]
        suggestions.append({
            "prioridad": "Media",
            "categoria": "Social",
            "tarea": "Completar etiquetas Open Graph esenciales (og:title, og:description, og:image).",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": f"Faltan: {', '.join(missing) if missing else 'revisar coherencia'}"
        })

    # Twitter Card
    tw_card = (tw.get("twitter:card") or "").lower()
    if tw_status != "green" or tw_card not in {"summary", "summary_large_image"}:
        suggestions.append({
            "prioridad": "Media",
            "categoria": "Social",
            "tarea": "Definir Twitter Card (summary o summary_large_image) con título, descripción e imagen.",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": f"twitter:card actual: {tw_card or 'no definido'}"
        })

    # Imagen válida
    if result["preview_image"] and not img_looks_ok:
        suggestions.append({
            "prioridad": "Baja",
            "categoria": "Social",
            "tarea": "Asegurar que la URL de og:image/twitter:image es una imagen válida (formato y acceso).",
            "impacto": "Bajo",
            "esfuerzo": "Bajo",
            "nota": f"URL imagen: {result['preview_image']}"
        })

    # Sugerencias guiadas por keywords (enriquecidas)
    if keywords:
        for kw, detail in kw_rel.get("by_keyword", {}).items():
            og_t = detail["og"]["title"]["match"]
            og_d = detail["og"]["description"]["match"]
            tw_t = detail["twitter"]["title"]["match"]
            tw_d = detail["twitter"]["description"]["match"]

            if og_t == "none":
                suggestions.append({
                    "prioridad": "Media",
                    "categoria": "Social",
                    "tarea": f"Incluir la keyword «{kw}» en og:title de forma natural.",
                    "impacto": "Medio",
                    "esfuerzo": "Bajo",
                    "nota": "Consistencia con <title> y H1."
                })
            if tw_t == "none":
                suggestions.append({
                    "prioridad": "Baja",
                    "categoria": "Social",
                    "tarea": f"Incluir «{kw}» en twitter:title si aporta claridad.",
                    "impacto": "Bajo",
                    "esfuerzo": "Bajo",
                    "nota": "Valora copy más persuasivo que keyword exacta."
                })
            if og_d == "none" and tw_d == "none":
                suggestions.append({
                    "prioridad": "Baja",
                    "categoria": "Social",
                    "tarea": f"Mencionar «{kw}» en og:description o twitter:description si procede.",
                    "impacto": "Bajo",
                    "esfuerzo": "Bajo",
                    "nota": "Introduce el término en contexto de beneficio."
                })

    result["suggestions"] = suggestions
    return result
