# opun_seo_lite/audit_crawl.py
from typing import Dict, List, Tuple
import re

from utils import (
    fetch_url,
    get_html_soup,
    header_value,
    guess_sitemap_and_robots,
)

_HEADER_KEYS = ["content-type", "content-encoding", "cache-control", "vary", "x-robots-tag", "server"]


def _status(ok: bool, warn: bool = False) -> str:
    if ok:
        return "green"
    return "amber" if warn else "red"


def _chain_status(chain: List[Tuple[int, str]], final_status: int) -> str:
    # Verde si 200 sin redirecciones, ámbar si 1 hop 301/302/307/308 a 200, rojo si >1 hop o no 200
    if final_status == 200 and len(chain) == 0:
        return "green"
    if final_status == 200 and len(chain) == 1 and chain[-1][0] in (301, 302, 307, 308):
        return "amber"
    return "red"


def audit_crawl_indexability(url: str) -> Dict:
    """
    Rastreo e indexabilidad:
    - Cadena de redirects + status final
    - Cabeceras clave
    - x-robots-tag
    - robots.txt y sitemap
    """
    # Estructura base para no romper UI en caso de error
    base: Dict = {
        "status": "ok",
        "error": None,
        "url": url,
        "redirect_chain": [],           # [(status, url), ...]
        "final_status": None,
        "chain_status": "red",
        "headers": [{"key": k, "value": ""} for k in _HEADER_KEYS],
        "x_robots_tag": "",
        "robots_info": {"declared": "", "ok": False, "final_url": "", "status": None},
        "sitemap_info": {"declared": "", "ok": False, "final_url": "", "status": None},
        "suggestions": [],
    }

    try:
        resp, history, _ = fetch_url(url)
    except Exception as e:
        base["status"] = "error"
        base["error"] = f"{e}"
        base["suggestions"] = [{
            "prioridad": "Media",
            "categoria": "Indexabilidad",
            "tarea": "Restablecer conectividad/TLS del sitio para evaluar redirects, cabeceras y robots/sitemap.",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": "Error de red (TLS/SSL o conexión) impidió analizar la cadena de redirecciones."
        }]
        return base

    soup = get_html_soup(resp)

    chain = [(s, u) for (s, u) in history]  # list of tuples
    final_status = resp.status_code
    xrobots = header_value(resp.headers, "x-robots-tag").lower()

    headers_list = []
    for k in _HEADER_KEYS:
        headers_list.append(
            {"key": k, "value": header_value(resp.headers, k)}
        )

    # robots / sitemap (esta función ya maneja errores internos con try_fetch)
    rs = guess_sitemap_and_robots(resp.url, soup)

    result = {
        **base,
        "status": "ok",
        "error": None,
        "redirect_chain": chain,
        "final_status": final_status,
        "chain_status": _chain_status(chain, final_status),
        "headers": headers_list,
        "x_robots_tag": xrobots,
        "robots_info": rs.get("robots_txt", {}),
        "sitemap_info": rs.get("sitemap", {}),
        "suggestions": [],
    }

    suggestions: List[Dict] = []

    if result["chain_status"] == "red":
        hop_count = len(chain)
        suggestions.append({
            "prioridad": "Alta",
            "categoria": "Indexabilidad",
            "tarea": "Reducir cadena de redirecciones (ideal 0, máximo 1 hop).",
            "impacto": "Alto",
            "esfuerzo": "Medio",
            "nota": f"Hops: {hop_count}, estado final: {final_status}"
        })

    if final_status != 200:
        suggestions.append({
            "prioridad": "Alta",
            "categoria": "Indexabilidad",
            "tarea": "Asegurar respuesta 200 en la URL canónica final.",
            "impacto": "Alto",
            "esfuerzo": "Medio",
            "nota": f"Estado final: {final_status}"
        })

    if "noindex" in (xrobots or ""):
        suggestions.append({
            "prioridad": "Alta",
            "categoria": "Indexabilidad",
            "tarea": "Eliminar 'noindex' de la cabecera X-Robots-Tag en producción.",
            "impacto": "Alto",
            "esfuerzo": "Bajo",
            "nota": f"x-robots-tag: {xrobots}"
        })

    # Robots.txt
    robots_ok = result["robots_info"].get("ok")
    if not robots_ok:
        suggestions.append({
            "prioridad": "Baja",
            "categoria": "Indexabilidad",
            "tarea": "Publicar robots.txt accesible.",
            "impacto": "Bajo",
            "esfuerzo": "Bajo",
            "nota": f"Intentado: {result['robots_info'].get('declared')}"
        })

    # Sitemap
    sitemap_ok = result["sitemap_info"].get("ok")
    if not sitemap_ok:
        suggestions.append({
            "prioridad": "Media",
            "categoria": "Indexabilidad",
            "tarea": "Declarar sitemap.xml y referenciarlo en robots.txt.",
            "impacto": "Medio",
            "esfuerzo": "Bajo",
            "nota": f"Intentado: {result['sitemap_info'].get('declared')}"
        })

    result["suggestions"] = suggestions
    return result
