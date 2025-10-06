# ai_service.py
import os, json, time, random
from typing import Dict, List, Any, Optional, Callable

# --- Carga .env (opcional, no falla si no está) ---
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# ===== IMPLEMENTACIÓN con OpenAI (SDK oficial) =====
# pip install --upgrade openai
from openai import OpenAI, APIError, RateLimitError, APITimeoutError

_client = None

# -----------------------------
# Configuración
# -----------------------------
DEFAULT_MODEL_GENERAL = os.getenv("OPENAI_MODEL_GENERAL", "gpt-4o-mini")   # para tasks/summary
DEFAULT_MODEL_COPY     = os.getenv("OPENAI_MODEL_COPY", "gpt-4o-mini")     # para copywriting
REQUEST_TIMEOUT_SEC    = int(os.getenv("OPENAI_TIMEOUT_SEC", "40"))
MAX_TOKENS_GENERAL     = int(os.getenv("OPENAI_MAX_TOKENS", "1200"))
TEMPERATURE_GENERAL    = float(os.getenv("OPENAI_TEMPERATURE", "0.2"))
MAX_PROMPT_CHARS       = int(os.getenv("OPENAI_MAX_PROMPT_CHARS", "12000"))
MAX_JSON_CHARS         = int(os.getenv("OPENAI_MAX_JSON_CHARS", "6000"))
RETRY_MAX_ATTEMPTS     = int(os.getenv("OPENAI_RETRY_ATTEMPTS", "3"))
RETRY_BACKOFF_BASE     = float(os.getenv("OPENAI_RETRY_BACKOFF_BASE", "0.8"))
RETRY_BACKOFF_JITTER   = float(os.getenv("OPENAI_RETRY_BACKOFF_JITTER", "0.4"))

# -----------------------------
# Utilidades
# -----------------------------
def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            # Evitamos romper la app; lanzamos error claro para capturar arriba
            raise RuntimeError("Falta OPENAI_API_KEY en variables de entorno.")
        _client = OpenAI(api_key=api_key)
    return _client

def _truncate(s: str, max_chars: int) -> str:
    if s is None:
        return ""
    if len(s) <= max_chars:
        return s
    return s[:max_chars] + "…"

def _compact_json(obj: Any, max_chars: int = MAX_JSON_CHARS) -> str:
    try:
        s = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    except Exception:
        s = str(obj)
    return _truncate(s, max_chars)

def _retry(fn: Callable[[], str]) -> str:
    last_err = None
    for attempt in range(1, RETRY_MAX_ATTEMPTS + 1):
        try:
            return fn()
        except (RateLimitError, APITimeoutError, APIError) as e:
            last_err = e
            # backoff exponencial con jitter
            sleep_s = (RETRY_BACKOFF_BASE ** attempt) + random.uniform(0, RETRY_BACKOFF_JITTER)
            time.sleep(sleep_s)
        except Exception as e:
            last_err = e
            break
    # Si no funcionó, relanzamos para que la capa superior decida (app.py maneja errores de IA con mensajes)
    raise last_err if last_err else RuntimeError("Fallo desconocido en llamada a LLM.")

def _llm(
    system_prompt: str,
    user_prompt: str,
    *,
    model: str = DEFAULT_MODEL_GENERAL,
    temperature: float = TEMPERATURE_GENERAL,
    max_tokens: int = MAX_TOKENS_GENERAL,
    force_json: bool = False,
) -> str:
    client = _get_client()
    sys_msg = _truncate(system_prompt, MAX_PROMPT_CHARS // 3)
    usr_msg = _truncate(user_prompt, MAX_PROMPT_CHARS)

    def _call() -> str:
        kwargs = dict(
            model=model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": sys_msg},
                {"role": "user", "content": usr_msg},
            ],
            max_tokens=max_tokens,
            timeout=REQUEST_TIMEOUT_SEC,  # requiere openai>=1.30
        )
        # JSON mode (mejor para parsear)
        if force_json:
            kwargs["response_format"] = {"type": "json_object"}
        resp = client.chat.completions.create(**kwargs)
        return (resp.choices[0].message.content or "").strip()

    return _retry(_call)

def _parse_json_safe(raw: str) -> Any:
    """
    Intenta parsear JSON de forma robusta. Si falla, intenta extraer el primer
    bloque {...} o [...] con heurística simple.
    """
    try:
        return json.loads(raw)
    except Exception:
        pass
    # Heurística básica: recorta hasta el primer y último brace/bracket
    for open_ch, close_ch in [("{", "}"), ("[", "]")]:
        try:
            start = raw.find(open_ch)
            end = raw.rfind(close_ch)
            if start != -1 and end != -1 and end > start:
                snippet = raw[start : end + 1]
                return json.loads(snippet)
        except Exception:
            continue
    # Devuelve None si imposible
    return None

# -----------------------------
# 1) Generación de plan de acciones
# -----------------------------
def ai_suggest_actions(
    url: str,
    keywords: List[str],
    meta: Dict,
    social: Dict,
    perf: Dict,
    crawl: Dict,
    headings: Dict,
    tone: str = "profesional-directo"
) -> List[Dict]:
    """
    Devuelve lista de tareas [{prioridad,categoria,tarea,impacto,esfuerzo,nota}]
    listas para inyectar en el plan.
    """
    sys = f"Eres un consultor SEO senior con estilo {tone}. Devuelve SOLO JSON válido con una lista 'tasks'."
    usr = f"""
Contexto:
URL: {url}
Keywords: {keywords}

META: {_compact_json(meta)}
SOCIAL: {_compact_json(social)}
PERF: {_compact_json(perf)}
CRAWL: {_compact_json(crawl)}
HEADINGS: {_compact_json(headings)}

Instrucción:
- Genera 8-15 tareas accionables equilibrando quick wins y mejoras core.
- Cada tarea: prioridad(Alta/Media/Baja), categoría(On-Page/Social/WPO/Indexabilidad/Otros), tarea, impacto(Alto/Medio/Bajo), esfuerzo(Alto/Medio/Bajo), nota (breve).
- Foco en alinear la página con las keywords objetivo y en resolver issues detectados.
- Formato de salida JSON:
{{"tasks":[{{"prioridad":"Alta","categoría":"On-Page","tarea":"…","impacto":"Alto","esfuerzo":"Bajo","nota":"…"}}]}}
"""
    try:
        raw = _llm(sys, usr, model=DEFAULT_MODEL_GENERAL, temperature=TEMPERATURE_GENERAL, max_tokens=MAX_TOKENS_GENERAL, force_json=True)
        data = _parse_json_safe(raw) or {}
        tasks = data.get("tasks", [])
        out = []
        for t in tasks:
            out.append({
                "prioridad": t.get("prioridad", "Media"),
                "categoria": t.get("categoría", t.get("categoria", "Otros")),
                "tarea": t.get("tarea", ""),
                "impacto": t.get("impacto", "Medio"),
                "esfuerzo": t.get("esfuerzo", "Medio"),
                "nota": t.get("nota", "")
            })
        return out
    except Exception:
        # Fallback silencioso
        return []

# -----------------------------
# 2) Reescritura asistida de elementos (copy)
# -----------------------------
def ai_rewrite_elements(
    keywords: List[str],
    brand: Optional[str],
    meta: Dict,
    max_variants: int = 3,
    tone: str = "claro-atractivo"
) -> Dict[str, List[str]]:
    """
    Devuelve propuestas de titles, descriptions, h1 y h2.
    """
    title = (meta.get("title") or {}).get("value", "")
    desc  = (meta.get("description") or {}).get("value", "")
    sys = f"Eres copywriter SEO. Estilo {tone}. Devuelve SOLO JSON válido con listas: titles, descriptions, h1, h2."
    usr = f"""
Keywords objetivo: {keywords}
Marca: {brand or '—'}
Title actual: {title}
Meta actual: {desc}

Reglas:
- Genera hasta {max_variants} variantes por campo.
- Title 30–60 caracteres, incluir keyword principal si natural; puedes añadir la marca.
- Meta 70–160 caracteres, valor + CTA, evitar stuffing y repeticiones.
- H1 coherente, no duplicar el title literal.
- H2 de refuerzo semántico (2-5 opciones).

Salida JSON:
{{"titles":["..."],"descriptions":["..."],"h1":["..."],"h2":["..."]}}
"""
    try:
        raw = _llm(sys, usr, model=DEFAULT_MODEL_COPY, temperature=0.5, max_tokens=MAX_TOKENS_GENERAL, force_json=True)
        data = _parse_json_safe(raw) or {}
        return {
            "titles": data.get("titles", [])[:max_variants],
            "descriptions": data.get("descriptions", [])[:max_variants],
            "h1": data.get("h1", [])[:max_variants],
            "h2": data.get("h2", [])[:max_variants],
        }
    except Exception:
        return {"titles": [], "descriptions": [], "h1": [], "h2": []}

# -----------------------------
# 3) Resumen ejecutivo para reporte (HTML simple)
# -----------------------------
def ai_exec_summary(
    url: str,
    keywords: List[str],
    meta: Dict,
    social: Dict,
    perf: Dict,
    crawl: Dict,
    plan_df_records: List[Dict]
) -> str:
    """
    Devuelve HTML simple (<p>, <ul>, <li>) con resumen ejecutivo y próximos pasos.
    """
    sys = "Eres un consultor SEO que escribe resúmenes ejecutivos claros, orientados a negocio."
    usr = f"""
URL: {url}
Keywords: {keywords}

Hallazgos principales (META): {_compact_json(meta)}
Hallazgos sociales: {_compact_json(social)}
Rendimiento (WPO): {_compact_json(perf)}
Indexabilidad: {_compact_json(crawl)}
Plan propuesto: {_compact_json(plan_df_records)}

Redacta 2-3 párrafos (máx 180 palabras), tono ejecutivo:
- Diagnóstico breve (estado general + oportunidades clave).
- 3 próximos pasos prioritarios (bullets claros, 1 línea cada uno).
Devuelve HTML simple usando solo <p>, <ul>, <li>.
"""
    try:
        return _llm(
            sys,
            usr,
            model=DEFAULT_MODEL_GENERAL,
            temperature=0.3,
            max_tokens=500,
            force_json=False,  # aquí queremos HTML, no JSON
        )
    except Exception:
        # Fallback minimalista si falla la IA
        return (
            "<p><b>Resumen ejecutivo:</b> Se han detectado oportunidades de mejora en metadatos, social, rendimiento e indexabilidad. "
            "Se recomienda priorizar acciones de alto impacto que alineen la página con las keywords objetivo y reduzcan fricciones técnicas.</p>"
            "<ul><li>Optimizar títulos y meta descriptions con foco en intención de búsqueda.</li>"
            "<li>Normalizar OG/Twitter Cards y mejorar tiempo al primer byte (TTFB).</li>"
            "<li>Revisar redirecciones/cabeceras y fortalecer la arquitectura semántica (H1/H2).</li></ul>"
        )
