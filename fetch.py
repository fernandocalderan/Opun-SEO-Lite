# opun_seo_lite/fetch.py
import requests, ssl, certifi
from urllib3.util import Retry
from requests.adapters import HTTPAdapter

# UA y cabeceras "de navegador"
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

class TLSHttpAdapter(HTTPAdapter):
    """HTTPAdapter con SSLContext que fuerza TLS 1.2+ y usa certifi."""
    def __init__(self, *args, **kwargs):
        self._ssl_context = ssl.create_default_context(cafile=certifi.where())
        # En algunos entornos esto ayuda a evitar handshakes raros:
        if hasattr(ssl, "TLSVersion"):
            self._ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
        super().__init__(*args, **kwargs)

    def init_poolmanager(self, connections, maxsize, block=False, **pool_kwargs):
        pool_kwargs["ssl_context"] = self._ssl_context
        return super().init_poolmanager(connections, maxsize, block=block, **pool_kwargs)

    def proxy_manager_for(self, *args, **kwargs):
        kwargs["ssl_context"] = self._ssl_context
        return super().proxy_manager_for(*args, **kwargs)

# Sesión global con retries y backoff
_session = requests.Session()
retries = Retry(
    total=5,                # hasta 5 intentos
    connect=5,
    read=5,
    backoff_factor=0.6,     # 0.6s, 1.2s, 2.4s...
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET", "HEAD"],
    raise_on_status=False,
)
adapter = TLSHttpAdapter(max_retries=retries, pool_connections=10, pool_maxsize=20)
_session.mount("https://", adapter)
_session.mount("http://", HTTPAdapter(max_retries=retries))

def get(url: str, timeout: int = 20) -> requests.Response:
    # Nota: verify y certs los maneja el adapter con certifi
    resp = _session.get(url, headers=BROWSER_HEADERS, timeout=(10, timeout), allow_redirects=True)
    return resp
