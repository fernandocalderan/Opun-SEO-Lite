import os

# === API KEYS ===
OPUN_PSI_API_KEY         = os.getenv("OPUN_PSI_API_KEY", "")
OPUN_CRUX_API_KEY        = os.getenv("OPUN_CRUX_API_KEY", "")
OPUN_GSC_CLIENT_ID       = os.getenv("OPUN_GSC_CLIENT_ID", "")
OPUN_GSC_CLIENT_SECRET   = os.getenv("OPUN_GSC_CLIENT_SECRET", "")
OPUN_GSC_REFRESH_TOKEN   = os.getenv("OPUN_GSC_REFRESH_TOKEN", "")
OPUN_CSE_API_KEY         = os.getenv("OPUN_CSE_API_KEY", "")
OPUN_CSE_CX              = os.getenv("OPUN_CSE_CX", "")
OPUN_SAFEBROWSING_API_KEY= os.getenv("OPUN_SAFEBROWSING_API_KEY", "")
OPUN_WEBRISK_API_KEY     = os.getenv("OPUN_WEBRISK_API_KEY", "")
OPUN_KG_API_KEY          = os.getenv("OPUN_KG_API_KEY", "")

# === FLAGS ===
ENABLE_CRUX              = os.getenv("ENABLE_CRUX", "True") == "True"
ENABLE_PSI               = os.getenv("ENABLE_PSI", "True") == "True"
ENABLE_GSC_INSPECTION    = os.getenv("ENABLE_GSC_INSPECTION", "False") == "True"
ENABLE_SAFE_BROWSING     = os.getenv("ENABLE_SAFE_BROWSING", "True") == "True"
ENABLE_KG                = os.getenv("ENABLE_KG", "True") == "True"
ENABLE_TRENDS            = os.getenv("ENABLE_TRENDS", "False") == "True"
ENABLE_TOPIC_GAP         = os.getenv("ENABLE_TOPIC_GAP", "True") == "True"

# === TIMEOUTS / RETRIES (puedes ajustar) ===
HTTP_TIMEOUT_SEC = 25
