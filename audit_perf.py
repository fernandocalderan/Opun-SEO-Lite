# opun_seo_lite/audit_perf.py
from typing import Dict, List
import re

from utils import fetch_url, header_value, readable_bytes, get_html_soup, extract_links_and_images

def _ttfb_status(ms: int) -> str:
    if ms is None:
        return "red"
    if ms <= 300:
        return "green"
    if ms <= 600:
        return "amber"
    return "red"

def _bool_status(ok: bool, warn: bool = False) -> str:
    if ok:
        return "green"
    return "amber" if warn else "red"

def _has_compression(headers: dict) -> bool:
    enc = header_value(headers, "content-encoding").lower()
    return any(x in enc for x in ["br", "gzip", "deflate"])

def _has_cache(headers: dict) -> bool:
    cc = header_value(headers, "cache-control").lower()
    # consideramos estático si tiene max-age, s-maxage o public
    return any(k in cc for k in ["max-age", "s-maxage", "public"])

def audit_performance(url: str) -> Dict:
    """
    Auditoría ligera de rendimiento (mini WPO):
    - TTFB (ms)
    - Peso HTML
    - Nº imágenes referenciadas (en HTML)
    - ¿Compresión (gzip/br)?
    - ¿Cache-Control?
    - Nº aproximado de enlaces (para dar idea de solicitudes potenciales)
    Siempre retorna una estructura estable con 'status' y 'error'.
    """
    # Estructura base por si hay error
    base: Dict = {
        "status": "ok",
        "error": None,
        "url": url,
        "ttfb_ms": None,
        "ttfb_status": "red",
        "html_size_bytes": 0,
        "html_size_readable": readable_bytes(0),
        "num_images": 0,
        "num_links": 0,
        "compression": {"value": False, "status": "red"},
        "cache_control": {"value": "", "status": "amber"},  # amber si no definido
        "content_type": "",
        "suggestions": [],
    }

    try:
        resp, _, ttfb_ms = fetch_url(url)
    except Exception as e:
        # No propagamos: devolvemos bloque con error y sugerencia
        base["status"] = "error"
        base["error"] = f"{e}"
        base["suggestions"] = [{
            "prioridad": "Alta",
            "categoria": "WPO",
            "tarea": "Restablecer conectividad/TLS del sitio para poder medir rendimiento (TTFB, caché, compresión).",
            "impacto": "Alto",
            "esfuerzo": "Medio",
            "nota": "Fallo de red (TLS/SSL, tiempo de espera o conexión) impidió medir."
        }]
        return base

    # Métricas básicas a partir de la respuesta
    html_size = len(resp.content or b"")
    headers = resp.headers or {}
    ctype = header_value(headers, "content-type")

    soup = get_html_soup(resp)
    if soup is not None:
        links, images = extract_links_and_images(soup, resp.url)
    else:
        # Si no es HTML, no intentamos parsear enlaces/imagenes
        links, images = [], []

    compression = _has_compression(headers)
    caching = _has_cache(headers)

    result = {
        **base,
        "status": "ok",
        "error": None,
        "ttfb_ms": ttfb_ms,
        "ttfb_status": _ttfb_status(ttfb_ms),
        "html_size_bytes": html_size,
        "html_size_readable": readable_bytes(html_size),
        "num_images": len(images),
        "num_links": len(links),
        "compression": {"value": compression, "status": _bool_status(compression)},
        "cache_control": {"value": header_value(headers, "cache-control"), "status": _bool_status(caching, warn=True)},
        "content_type": ctype,
        "suggestions": [],
    }

    suggestions: List[Dict] = []

    if result["ttfb_status"] != "green":
        suggestions.append({
            "prioridad": "Alta",
            "categoria": "WPO",
            "tarea": "Reducir TTFB por debajo de 300 ms (caché, edge/CDN, optimización backend/DB, hosting).",
            "impacto": "Alto",
            "esfuerzo": "Medio",
            "nota": f"TTFB actual: {ttfb_ms} ms"
        })

    if not compression:
        suggestions.append({
            "prioridad": "Media",
            "categoria": "WPO",
            "tarea": "Habilitar compresión (brotli/gzip) para respuestas HTML/CSS/JS.",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": "No se detectó Content-Encoding: br/gzip"
        })

    if not caching:
        suggestions.append({
            "prioridad": "Media",
            "categoria": "WPO",
            "tarea": "Definir políticas de caché con Cache-Control (max-age) para recursos estáticos.",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": f"Cache-Control actual: {result['cache_control']['value'] or 'no definido'}"
        })

    if soup is not None:
        if len(images) > 15:
            suggestions.append({
                "prioridad": "Baja",
                "categoria": "WPO",
                "tarea": "Optimizar número y peso de imágenes (lazy-load, formatos modernos, sprites/íconos).",
                "impacto": "Medio",
                "esfuerzo": "Medio",
                "nota": f"Imágenes encontradas en HTML: {len(images)}"
            })

        if html_size > 200_000:  # ~200 KB
            suggestions.append({
                "prioridad": "Baja",
                "categoria": "WPO",
                "tarea": "Reducir tamaño del HTML (minificar, fragmentos, cachear plantillas).",
                "impacto": "Bajo",
                "esfuerzo": "Bajo",
                "nota": f"Peso HTML: {readable_bytes(html_size)}"
            })
    else:
        # Si no hay HTML, avisar suavemente
        suggestions.append({
            "prioridad": "Baja",
            "categoria": "WPO",
            "tarea": "Entregar contenido HTML para auditorías on-page más completas.",
            "impacto": "Bajo",
            "esfuerzo": "Bajo",
            "nota": f"Content-Type detectado: {ctype or 'desconocido'}"
        })

    result["suggestions"] = suggestions
    return result
