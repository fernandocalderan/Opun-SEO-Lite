from __future__ import annotations

import json
from typing import Any

from openai import OpenAI

from app.core.config import get_settings


def generate_summary_and_suggestions(
    url: str,
    keywords: list[str] | None = None,
    metrics: dict[str, Any] | None = None,
) -> tuple[str, list[dict]]:
    """
    Llama a OpenAI para producir un resumen ejecutivo HTML y sugerencias
    estructuradas en español. Devuelve (html, suggestions[]).
    En caso de error o falta de API key, lanza excepción para que el caller haga fallback.
    """
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY no configurada")

    client = OpenAI(api_key=settings.openai_api_key)
    model = settings.openai_model or "gpt-4o-mini"

    input_payload = {
        "url": url,
        "keywords": keywords or [],
        "metrics": metrics or {},
    }

    system = (
        "Eres un analista senior de SEO. Hablas en español claro y conciso. "
        "Devuelve JSON con dos claves: executive_summary_html (string) y suggestions (array). "
        "Cada suggestion debe tener: prioridad (Alta/Media/Baja), tarea, categoria, impacto (Alto/Medio/Bajo), esfuerzo (Bajo/Medio/Alto), nota (opcional). "
        "El resumen debe ser breve (1–2 párrafos) en HTML con <p> y resaltar oportunidades clave."
    )

    user = (
        "Genera resumen y sugerencias basadas en la siguiente entrada. "
        "No inventes datos; usa términos genéricos si faltan métricas.\n\n"
        f"Input: {json.dumps(input_payload, ensure_ascii=False)}"
    )

    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    content = resp.choices[0].message.content or "{}"
    data = json.loads(content)
    html = data.get("executive_summary_html") or data.get("executive_summary") or ""
    suggestions = data.get("suggestions") or []
    # Asegurar tipos básicos
    if not isinstance(suggestions, list):
        suggestions = []
    return str(html), suggestions

