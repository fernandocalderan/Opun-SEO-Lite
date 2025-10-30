# opun_seo_lite/utils.py
import re
import time
import json
from urllib.parse import urlparse, urlunparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup

DEFAULT_HEADERS = {
    "User-Agent": "OpunSEO-Lite/1.0 (+https://opunnence.com) Python-Requests",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Connection": "close",
    "Cache-Control": "no-cache",
}

REQUEST_TIMEOUT = 20  # seconds
MAX_CONTENT = 3_500_000  # 3.5 MB max to parse


def normalize_url(url: str) -> str:
    """Normaliza una URL: asegura esquema, quita espacios y fragmentos."""
    url = (url or "").strip()
    if not url:
        return url
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    parts = list(urlparse(url))
    # limpiar fragmento
    parts[5] = ""  # fragment
    # normalizar netloc (sin espacios)
    parts[1] = (parts[1] or "").strip().rstrip("/")
    # path vacío -> "/"
    if not parts[2]:
        parts[2] = "/"
    return urlunparse(parts)


# ====== Red con reintentos y fallbacks ======
_session = None
def _build_session() -> requests.Session:
    global _session
    if _session is not None:
        return _session
    s = requests.Session()
    retries = Retry(
        total=3,
        connect=3,
        read=3,
        backoff_factor=0.6,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "HEAD"],
        raise_on_status=False,
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retries, pool_connections=5, pool_maxsize=10)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    s.headers.update(DEFAULT_HEADERS)
    _session = s
    return s


def _swap_scheme(url: str, to_scheme: str) -> str:
    p = urlparse(url)
    return urlunparse((to_scheme, p.netloc, p.path or "/", p.params, p.query, p.fragment))


def _fetch_url_core(url: str):
    """
    Core con fallbacks:
      1) https verify=True
      2) http  verify=True
      3) https verify=False  (último recurso)
    Devuelve: (response, history, ttfb_ms)
    Lanza RuntimeError si todo falla.
    """
    base = normalize_url(url)
    sess = _build_session()

    attempts = [
        (base, True),                         # HTTPS normal
        (_swap_scheme(base, "http"), True),   # HTTP (por TLS roto)
        (base, False),                        # HTTPS sin verificación (último recurso)
    ]

    last_exc = None
    for try_url, verify_flag in attempts:
        try:
            start = time.perf_counter()
            resp = sess.get(
                try_url,
                allow_redirects=True,
                timeout=REQUEST_TIMEOUT,
                verify=verify_flag,
                stream=False,
            )
            _ = resp.content  # fuerza lectura (errores tardíos)
            ttfb_ms = int((resp.elapsed.total_seconds() or (time.perf_counter() - start)) * 1000)
            history = [(h.status_code, h.url) for h in resp.history]
            return resp, history, ttfb_ms
        except requests.RequestException as e:
            last_exc = e
            continue
        except Exception as e:
            last_exc = e
            continue

    raise RuntimeError(f"Error al solicitar la URL (con fallbacks): {last_exc!r}")


def fetch_url(url: str):
    """Descarga la URL con redirects y devuelve (response, history, ttfb_ms)."""
    return _fetch_url_core(url)
# ====== FIN red ======


def get_html_soup(resp: requests.Response):
    """
    Devuelve BeautifulSoup si el contenido es HTML o 'parece' HTML.
    Algunos servidores no mandan Content-Type correcto.
    """
    ctype = (resp.headers.get("Content-Type") or "").lower()
    content = resp.content[:MAX_CONTENT]
    looks_html = b"<html" in content[:1024].lower() or b"<!doctype html" in content[:1024].lower()
    if ("html" not in ctype) and not looks_html:
        return None
    try:
        return BeautifulSoup(content, "html.parser")
    except Exception:
        return None


def safe_text(el):
    if not el:
        return ""
    return re.sub(r"\s+", " ", el.get_text(strip=True) if hasattr(el, "get_text") else str(el)).strip()


def absolutize(base_url: str, link: str) -> str:
    from urllib.parse import urljoin
    return urljoin(base_url, link) if link else ""


def get_domain_root(url: str) -> str:
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}"


def try_fetch(path_url: str):
    """GET simple para recursos robots/sitemap, devolviendo (ok, url, status)."""
    try:
        s = _build_session()
        r = s.get(path_url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        return True, r.url, r.status_code
    except requests.RequestException:
        return False, path_url, None


def parse_meta_tags(soup: BeautifulSoup):
    meta = {}
    if not soup:
        return meta

    # Title
    title_tag = soup.find("title")
    meta["title"] = safe_text(title_tag)

    # Description
    desc = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    meta["description"] = (desc.get("content") or "").strip() if desc else ""

    # Robots meta
    robots = soup.find("meta", attrs={"name": re.compile(r"^robots$", re.I)})
    meta["robots"] = (robots.get("content") or "").strip().lower() if robots else ""

    # Canonical (rel puede ser lista)
    canonical = None
    for link in soup.find_all("link", href=True):
        rel = link.get("rel")
        # rel puede ser list o str
        if (isinstance(rel, (list, tuple)) and any(re.match(r"^canonical$", str(r), re.I) for r in rel)) or \
           (isinstance(rel, str) and re.match(r"^canonical$", rel, re.I)):
            canonical = link.get("href")
            break
    meta["canonical"] = (canonical or "").strip()

    # Headings (top)
    h1 = [safe_text(h) for h in soup.find_all("h1")]
    h2 = [safe_text(h) for h in soup.find_all("h2")]
    h3 = [safe_text(h) for h in soup.find_all("h3")]
    meta["headings"] = {"h1": h1, "h2": h2[:10], "h3": h3[:10]}

    return meta


def parse_og_twitter(soup: BeautifulSoup):
    og = {}
    tw = {}
    if not soup:
        return og, tw

    def _content(name=None, prop=None):
        if name:
            el = soup.find("meta", attrs={"name": name})
        else:
            el = soup.find("meta", attrs={"property": prop})
        return (el.get("content") or "").strip() if el else ""

    # Open Graph
    for key in ["og:title", "og:description", "og:image", "og:type", "og:url", "og:site_name"]:
        og[key] = _content(prop=key)

    # Twitter
    for key in ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]:
        tw[key] = _content(name=key)

    return og, tw


def extract_links_and_images(soup: BeautifulSoup, base_url: str):
    links = []
    images = []
    if not soup:
        return links, images
    for a in soup.find_all("a", href=True):
        links.append(absolutize(base_url, a["href"]))
    for img in soup.find_all("img", src=True):
        images.append(absolutize(base_url, img["src"]))
    return links, images


def guess_sitemap_and_robots(url: str, soup: BeautifulSoup):
    root = get_domain_root(url)
    robots_url = f"{root}/robots.txt"
    sitemap_url = f"{root}/sitemap.xml"

    # intentos de detección html (<link rel="sitemap" ...>)
    html_sitemap = ""
    if soup:
        link_smap = soup.find("link", attrs={"rel": re.compile(r"sitemap", re.I)})
        if link_smap and link_smap.get("href"):
            html_sitemap = absolutize(root + "/", link_smap["href"])

    robots_ok, robots_final, robots_status = try_fetch(robots_url)
    sitemap_ok, sitemap_final, sitemap_status = try_fetch(html_sitemap or sitemap_url)

    return {
        "robots_txt": {
            "declared": robots_url,
            "ok": robots_ok,
            "final_url": robots_final,
            "status": robots_status,
        },
        "sitemap": {
            "declared": html_sitemap or sitemap_url,
            "ok": sitemap_ok,
            "final_url": sitemap_final,
            "status": sitemap_status,
        },
    }


def header_value(headers: dict, key: str) -> str:
    for k, v in headers.items():
        if k.lower() == key.lower():
            return v
    return ""


def readable_bytes(n: int) -> str:
    if n is None:
        return "-"
    for unit in ["B", "KB", "MB", "GB"]:
        if n < 1024.0:
            return f"{n:.1f} {unit}"
        n /= 1024.0
    return f"{n:.1f} TB"


def json_dumps(data) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2)
