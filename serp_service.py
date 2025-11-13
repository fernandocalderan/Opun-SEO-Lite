# opun_seo_lite/serp_service.py
from __future__ import annotations
import time
import hashlib
import threading
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Tuple
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

import requests

# -----------------------------
#   Cache TTL simple y seguro
# -----------------------------
class TTLCache:
    def __init__(self, ttl_seconds: int = 1800, max_items: int = 256):
        self.ttl = int(ttl_seconds)
        self.max = int(max_items)
        self._store: Dict[str, Tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def _evict_if_needed(self):
        if len(self._store) <= self.max:
            return
        # Evict: más antiguo primero
        items = sorted(self._store.items(), key=lambda kv: kv[1][0])
        for k, _ in items[: max(1, len(items) - self.max)]:
            self._store.pop(k, None)

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            v = self._store.get(key)
            if not v:
                return None
            ts, data = v
            if (time.time() - ts) > self.ttl:
                self._store.pop(key, None)
                return None
            return data

    def set(self, key: str, value: Any):
        with self._lock:
            self._store[key] = (time.time(), value)
            self._evict_if_needed()

def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# -----------------------------
#   Normalización de URLs
# -----------------------------
_TRACK_PARAMS = {"utm_source","utm_medium","utm_campaign","utm_term","utm_content",
                 "gclid","fbclid","msclkid","gbraid","wbraid"}

def _strip_tracking_query(query: str) -> str:
    if not query:
        return ""
    pairs = parse_qsl(query, keep_blank_values=True)
    clean = [(k, v) for (k, v) in pairs if k.lower() not in _TRACK_PARAMS]
    return urlencode(clean, doseq=True)

def normalize_url(u: str) -> Dict[str, str]:
    try:
        p = urlparse(u)
        domain = p.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        path = p.path or "/"
        if path != "/":
            path = path.rstrip("/")
        query = _strip_tracking_query(p.query)
        return {"domain": domain, "path": path, "query": query}
    except Exception:
        return {"domain": "", "path": "", "query": ""}

def urls_match_exactish(target_norm: Dict[str,str], found_url: str) -> bool:
    f = normalize_url(found_url)
    return (f["domain"] == target_norm["domain"]) and (f["path"] == target_norm["path"])

def urls_match_domain_only(target_norm: Dict[str,str], found_url: str) -> bool:
    f = normalize_url(found_url)
    return f["domain"] == target_norm["domain"]

# -----------------------------
#   SerpAPI (Google Orgánico)
# -----------------------------
def _google_domain_for_country(country: str) -> Optional[str]:
    dom_map = {
        "ES":"google.es","PT":"google.pt","BR":"google.com.br","US":"google.com","GB":"google.co.uk","MX":"google.com.mx",
        "AR":"google.com.ar","CL":"google.cl","CO":"google.com.co","PE":"google.com.pe","FR":"google.fr","DE":"google.de","IT":"google.it"
    }
    return dom_map.get(country.upper())

def _serpapi_params(lang: str, country: str) -> Dict[str, str]:
    params: Dict[str, str] = {}
    if lang and lang != "Auto":
        params["hl"] = {"es":"es","en":"en","pt":"pt","ca":"ca"}.get(lang, "en")
    if country and country != "Auto":
        params["gl"] = country.upper()
        gd = _google_domain_for_country(country.upper())
        if gd:
            params["google_domain"] = gd
    return params

def serpapi_google_web(
    query: str,
    num: int,
    lang: str,
    country: str,
    api_key: str,
    use_serpapi: bool,
    cache: TTLCache,
    quota_ok_cb: Callable[[], bool],
    quota_inc_cb: Callable[[], None],
    timeout: float = 25.0
) -> List[Dict[str, Any]]:
    """
    Devuelve lista de resultados orgánicos: [{title, url, domain, position, snippet, engine, provider, serp_ts}]
    Respeta cache TTL y contador de cuota (1 por llamada).
    """
    if not use_serpapi or not api_key:
        return []

    # Cache key
    cache_key = hashlib.sha1(
        f"serpapi|{query}|{num}|{lang}|{country}".encode("utf-8", errors="ignore")
    ).hexdigest()
    cached = cache.get(cache_key)
    if cached:
        return cached

    if not quota_ok_cb():
        return []

    endpoint = "https://serpapi.com/search.json"
    params = {
        "engine": "google",
        "q": query,
        "num": max(1, min(int(num), 100)),
        "api_key": api_key,
        "safe": "off",
    }
    params.update(_serpapi_params(lang, country))

    try:
        r = requests.get(endpoint, params=params, timeout=timeout)
        quota_inc_cb()  # contamos el intento/llamada (éxito o no; más simple de auditar)
        if r.status_code != 200:
            return []
        data = r.json()
        if data.get("error"):
            return []
        items = data.get("organic_results", []) or []
        rows: List[Dict[str, Any]] = []
        for it in items:
            link = it.get("link", "") or it.get("url", "")
            title = it.get("title", "")
            snippet = it.get("snippet", "") or " ".join(it.get("snippet_highlighted_words", []) or [])
            pos = it.get("position")
            # posición fallback por orden si no viene
            if pos is None:
                pos = len(rows) + 1
            domain = urlparse(link).netloc.lower() if link else ""
            if domain.startswith("www."):
                domain = domain[4:]
            rows.append({
                "title": title,
                "url": link,
                "domain": domain,
                "position": int(pos),
                "snippet": snippet,
                "engine": "google",
                "provider": "SerpAPI",
                "serp_ts": _utc_now_iso(),
            })
        cache.set(cache_key, rows)
        return rows
    except Exception:
        return []

# -----------------------------
#   Ranking de una URL objetivo
# -----------------------------
def find_rank_for_url(
    target_url: str,
    keyword: str,
    lang: str,
    country: str,
    depth: int,
    api_key: str,
    cache: TTLCache,
    allow_domain_match: bool,
    quota_ok_cb: Callable[[], bool],
    quota_inc_cb: Callable[[], None],
) -> Dict[str, Any]:
    target_norm = normalize_url(target_url)
    results = serpapi_google_web(
        query=keyword, num=depth, lang=lang, country=country,
        api_key=api_key, use_serpapi=True, cache=cache,
        quota_ok_cb=quota_ok_cb, quota_inc_cb=quota_inc_cb
    )

    found_exact = None
    found_same_domain = None

    for row in results:
        if urls_match_exactish(target_norm, row["url"]):
            found_exact = row
            break
    if not found_exact and allow_domain_match:
        for row in results:
            if urls_match_domain_only(target_norm, row["url"]):
                found_same_domain = row
                break

    if found_exact:
        return {
            "keyword": keyword,
            "status": "found_exact",
            "position": found_exact["position"],
            "found_url": found_exact["url"],
            "title": found_exact["title"],
            "lang": lang, "country": country,
            "depth": depth,
            "timestamp": _utc_now_iso(),
            "target_url": target_url
        }
    elif found_same_domain:
        return {
            "keyword": keyword,
            "status": "found_same_domain",
            "position": found_same_domain["position"],
            "found_url": found_same_domain["url"],
            "title": found_same_domain["title"],
            "lang": lang, "country": country,
            "depth": depth,
            "timestamp": _utc_now_iso(),
            "target_url": target_url
        }
    else:
        return {
            "keyword": keyword,
            "status": "not_found_topN",
            "position": None,
            "found_url": "",
            "title": "",
            "lang": lang, "country": country,
            "depth": depth,
            "timestamp": _utc_now_iso(),
            "target_url": target_url
        }

# ====== DEBUG / DIAGNÓSTICO SERP ======
def serpapi_debug_ping(
    query: str,
    num: int,
    lang: str,
    country: str,
    api_key: str,
    timeout: float = 25.0
) -> dict:
    """
    Llama a SerpAPI sin cache ni cuota, y devuelve info de diagnóstico.
    Útil para entender por qué no llegan resultados.
    """
    if not api_key:
        return {"ok": False, "reason": "missing_api_key"}

    endpoint = "https://serpapi.com/search.json"
    params = {
        "engine": "google",
        "q": query,
        "num": max(1, min(int(num), 100)),
        "api_key": api_key,
        "safe": "off",
    }
    params.update(_serpapi_params(lang, country))
    try:
        r = requests.get(endpoint, params=params, timeout=timeout)
        out = {
            "ok": r.status_code == 200,
            "status_code": r.status_code,
            "params": params,
        }
        try:
            data = r.json()
        except Exception:
            data = {"raw": r.text[:1200]}
        out["has_error"] = bool(data.get("error"))
        out["error"] = data.get("error")
        org = data.get("organic_results") or []
        out["organic_count"] = len(org)
        out["sample_titles"] = [it.get("title") for it in org[:3]]
        return out
    except Exception as e:
        return {"ok": False, "reason": f"exception: {e}"}
