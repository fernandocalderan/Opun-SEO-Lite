import streamlit as st
import pandas as pd
from datetime import datetime
import base64, mimetypes, os, json
from ui_components import render_kw_relevance_meta, render_kw_relevance_social
from ai_service import ai_suggest_actions, ai_rewrite_elements, ai_exec_summary  # usaremos y tendremos fallback

from utils import normalize_url
from audit_meta import audit_metadata, audit_headings_detail
from audit_social import audit_social
from audit_perf import audit_performance
from audit_crawl import audit_crawl_indexability
from ui_components import (
    inject_base_css,
    header_bar,
    render_metadata_cards,
    render_social_cards,
    render_perf_cards,
    render_crawl_grid,
    render_headings_table,
    render_suggestions_board,
    legend_block,
    toast_success,
)
from report_builder import build_html_report

import re

APP_TITLE = "Opun SEO Lite"
TABS = ["Auditoría", "Plan de acciones", "Reporte"]

# Ruta absoluta al logo
LOGO_PATH = os.path.join(os.path.dirname(__file__), "assets", "Logo Opunnence.png")

PLAN_COLUMNS = [
    "Prioridad", "Categoría", "Tarea", "Responsable",
    "Impacto", "Esfuerzo", "Estado", "Fecha objetivo", "Notas"
]

# =======================================================
# PROMPT para el Resumen Ejecutivo (IA)
# =======================================================
PROMPT_RESUMEN_EJECUTIVO = """
Escribe un “Resumen ejecutivo SEO” en español, tono técnico pero didáctico para cliente no especialista.
Estructura y formato: devuelve solo HTML simple (h4, p, ul, li, strong, em). No incluyas <html> ni <body>.

<h4>Contexto</h4>
- Sector/página y palabras clave objetivo (si hay).

<h4>Hallazgos clave</h4>
- Meta etiquetas (Title/Description/Robots/Canonical): qué está bien / qué falta y por qué importa.
- Contenidos & Relevancia (H1/H2, uso de keywords, canibalización si aplica).
- Estructura & Indexación (encabezados, enlazado interno, sitemap/robots).
- Rendimiento web (explica TTFB/LCP/CLS en una línea).
- Social (Open Graph/Twitter Cards): impacto en CTR/compartidos.

<h4>Impacto esperado</h4>
- 3 bullets sobre visibilidad, CTR y conversiones.

<h4>Recomendaciones priorizadas</h4>
- Quick wins (≤7 días): bullets con “Impacto: Alto/Medio/Bajo” y “Esfuerzo: Bajo/Medio/Alto”.
- 30–60 días: idem.
- 90 días: idem.

<h4>Próximos pasos</h4>
- 1–3 bullets.

Reglas de redacción:
- Frases cortas, verbos de acción, sin párrafos densos.
- Explica en una línea cualquier término técnico entre paréntesis.
- No inventes métricas: escribe “no disponible” si faltan datos.
- No uses tablas; solo listas claras.

DATOS (resume con sentido; no pegues raw JSON):
URL: {url}
KEYWORDS_OBJETIVO: {keywords}
META: {meta_json}
SOCIAL: {social_json}
PERF: {perf_json}
HEADINGS: {headings_json}
CRAWL: {crawl_json}
"""

# =======================================================
# Helpers de logo y plan
# =======================================================
def image_to_data_uri(path: str) -> str | None:
    try:
        with open(path, "rb") as f:
            b = f.read()
        mime = mimetypes.guess_type(path)[0] or "image/png"
        enc = base64.b64encode(b).decode("ascii")
        return f"data:{mime};base64,{enc}"
    except Exception:
        return None


def ensure_plan_schema(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        df = pd.DataFrame(columns=PLAN_COLUMNS)
    else:
        for c in PLAN_COLUMNS:
            if c not in df.columns:
                df[c] = "" if c != "Fecha objetivo" else pd.NaT
        other_cols = [c for c in df.columns if c not in PLAN_COLUMNS]
        df = df[PLAN_COLUMNS + other_cols]
    df["Fecha objetivo"] = pd.to_datetime(df["Fecha objetivo"], errors="coerce")
    return df


def format_plan_for_export(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    if "Fecha objetivo" in out.columns:
        try:
            out["Fecha objetivo"] = out["Fecha objetivo"].dt.strftime("%Y-%m-%d")
        except Exception:
            pass
    return out

# =======================================================
# Estado
# =======================================================
def init_state():
    if "url" not in st.session_state:
        st.session_state.url = ""
    if "keywords" not in st.session_state:
        st.session_state.keywords = []   # lista de strings, máx 5
    if "meta_result" not in st.session_state:
        st.session_state.meta_result = None
    if "social_result" not in st.session_state:
        st.session_state.social_result = None
    if "perf_result" not in st.session_state:
        st.session_state.perf_result = None
    if "crawl_result" not in st.session_state:
        st.session_state.crawl_result = None
    if "headings_detail" not in st.session_state:
        st.session_state.headings_detail = None
    if "suggestions" not in st.session_state:
        st.session_state.suggestions = []
    if "plan_df" not in st.session_state:
        st.session_state.plan_df = ensure_plan_schema(pd.DataFrame(columns=PLAN_COLUMNS))
    else:
        st.session_state.plan_df = ensure_plan_schema(st.session_state.plan_df)
    if "logo_data_uri" not in st.session_state:
        st.session_state.logo_data_uri = image_to_data_uri(LOGO_PATH)
    # Estado para IA
    if "ia_copy_props" not in st.session_state:
        st.session_state.ia_copy_props = None
    if "ia_report_summary_html" not in st.session_state:
        st.session_state.ia_report_summary_html = None
    if "ia_brand" not in st.session_state:
        st.session_state.ia_brand = ""
    if "ia_tone_actions" not in st.session_state:
        st.session_state.ia_tone_actions = "profesional-directo"
    if "ia_tone_copy" not in st.session_state:
        st.session_state.ia_tone_copy = "claro-atractivo"

# =======================================================
# Auditorías
# =======================================================
from utils import normalize_url
from audit_meta import audit_metadata, audit_headings_detail
from audit_social import audit_social
from audit_perf import audit_performance
from audit_crawl import audit_crawl_indexability

def _safe_audit_call(name: str, fn, url: str, **kwargs):
    """
    Envuelve llamadas a módulos de auditoría para que nunca rompan la app.
    Devuelve el dict del módulo o, en caso de excepción, un dict con status:error.
    """
    try:
        result = fn(url, **kwargs)
        if isinstance(result, dict) and "status" not in result:
            result["status"] = "ok"
            result["error"] = None
        return result
    except Exception as e:
        return {
            "status": "error",
            "error": f"{e}",
            "suggestions": [{
                "prioridad": "Media",
                "categoria": name,
                "tarea": f"Revisar conectividad/SSL del sitio para permitir la auditoría de {name}.",
                "impacto": "Medio",
                "esfuerzo": "Bajo",
                "nota": "Se produjo una excepción al ejecutar el módulo."
            }]
        }

def audit_all(url: str, keywords: list[str] | None = None):
    meta = _safe_audit_call("Metadatos", audit_metadata, url, keywords=keywords)
    social = _safe_audit_call("Social", audit_social, url, keywords=keywords)
    perf = _safe_audit_call("WPO", audit_performance, url)
    crawl = _safe_audit_call("Indexabilidad", audit_crawl_indexability, url)
    headings = _safe_audit_call("Encabezados", audit_headings_detail, url)

    suggestions = []
    for block in (meta, social, perf, crawl):
        if isinstance(block, dict):
            suggestions.extend(block.get("suggestions", []))

    st.session_state.meta_result = meta
    st.session_state.social_result = social
    st.session_state.perf_result = perf
    st.session_state.crawl_result = crawl
    st.session_state.headings_detail = headings
    st.session_state.suggestions = suggestions

# =======================================================
# IA: Fallback local con OpenAI para el Resumen Ejecutivo
# (solo si ai_exec_summary falla o no devuelve contenido)
# =======================================================
def _json_snippet(obj: dict, limit: int = 15000) -> str:
    try:
        return json.dumps(obj, ensure_ascii=False)[:limit]
    except Exception:
        return "(no disponible)"

def generate_exec_summary_fallback(
    url: str,
    keywords: list[str],
    meta: dict,
    social: dict,
    perf: dict,
    crawl: dict,
    headings: dict,
    model: str = "gpt-4o-mini",
    temperature: float = 0.3
) -> str:
    """Devuelve HTML (string) con el resumen ejecutivo IA o '' si no hay API key o falla la llamada."""
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_APIKEY") or ""
    if not api_key:
        return ""

    prompt = PROMPT_RESUMEN_EJECUTIVO.format(
        url=url,
        keywords=", ".join(keywords or []) or "no especificadas",
        meta_json=_json_snippet(meta),
        social_json=_json_snippet(social),
        perf_json=_json_snippet(perf),
        headings_json=_json_snippet(headings),
        crawl_json=_json_snippet(crawl),
    )

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Eres un consultor SEO senior. Escribes claro para cliente no técnico."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
        )
        html = (resp.choices[0].message.content or "").strip()
        # Sanidad: si el modelo envolviese accidentalmente html/body, lo aceptamos tal cual.
        return html
    except Exception as e:
        print("Fallback IA summary error:", e)
        return ""

# =======================================================
# IA: post-procesado visual para el resumen
# =======================================================
def postprocess_ia_summary(text: str) -> str:
    """
    Mejora el HTML devuelto por la IA añadiendo píldoras visuales para Impacto/Esfuerzo.
    No rompe si no encuentra coincidencias.
    """
    if not text:
        return text
    replacements = {
        "Impacto: Alto":   '<span class="pill green">Impacto: Alto</span>',
        "Impacto: Medio":  '<span class="pill amber">Impacto: Medio</span>',
        "Impacto: Bajo":   '<span class="pill red">Impacto: Bajo</span>',
        "Esfuerzo: Bajo":  '<span class="pill green">Esfuerzo: Bajo</span>',
        "Esfuerzo: Medio": '<span class="pill amber">Esfuerzo: Medio</span>',
        "Esfuerzo: Alto":  '<span class="pill red">Esfuerzo: Alto</span>',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text

# =======================================================
# Render UI
# =======================================================
def re_split(pattern, text):
    return re.split(pattern, text)

def _parse_keywords(raw: str) -> list[str]:
    # admite comas, punto y coma o saltos de línea
    parts = [p.strip() for p in re_split(r"[,\n;]", raw or "") if p.strip()]
    # dedup preservando orden
    seen = set()
    kws = []
    for p in parts:
        pl = p.lower()
        if pl not in seen:
            seen.add(pl)
            kws.append(p)
        if len(kws) >= 5:
            break
    return kws

def add_task_to_plan(task):
    df = ensure_plan_schema(st.session_state.plan_df)
    row = {
        "Prioridad": task.get("prioridad", "Media"),
        "Categoría": task.get("categoria", "On-Page"),
        "Tarea": task.get("tarea", ""),
        "Responsable": "",
        "Impacto": task.get("impacto", "Medio"),
        "Esfuerzo": task.get("esfuerzo", "Medio"),
        "Estado": "Pendiente",
        "Fecha objetivo": pd.NaT,
        "Notas": task.get("nota", "")
    }
    df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
    st.session_state.plan_df = ensure_plan_schema(df)
    toast_success("Añadido al plan ✅")

def export_plan(format_="CSV"):
    df = format_plan_for_export(ensure_plan_schema(st.session_state.plan_df))
    if format_ == "CSV":
        return df.to_csv(index=False).encode("utf-8"), "plan_acciones.csv", "text/csv"
    else:
        return df.to_json(orient="records", force_ascii=False, indent=2).encode("utf-8"), "plan_acciones.json", "application/json"

def import_plan(file):
    try:
        if file.name.lower().endswith(".csv"):
            df = pd.read_csv(file)
        else:
            df = pd.read_json(file)
        df = ensure_plan_schema(df)
        st.session_state.plan_df = df
        toast_success("Plan importado correctamente ✅")
    except Exception as e:
        st.error(f"Error al importar: {e}")

def render_auditoria():
    col_url, col_kw, col_btn = st.columns([3, 3, 1])
    with col_url:
        url = st.text_input("URL a auditar", st.session_state.url, placeholder="https://www.ejemplo.com/")
    with col_kw:
        raw_kws = st.text_input("Keywords (opcional, máx. 5, separadas por coma)", ", ".join(st.session_state.keywords))
    with col_btn:
        if st.button("Auditar", use_container_width=True):
            if url.strip():
                st.session_state.url = normalize_url(url)
                st.session_state.keywords = _parse_keywords(raw_kws)
                with st.spinner("Auditando..."):
                    audit_all(st.session_state.url, st.session_state.keywords)
            else:
                st.warning("Introduce una URL válida.")

    if not st.session_state.meta_result:
        st.info("Introduce una URL y pulsa **Auditar** (puedes añadir hasta 5 keywords opcionales).")
        return

    st.write("")
    legend_block()

    # Mostrar las keywords seleccionadas
    if st.session_state.keywords:
        st.caption("🔎 **Keywords objetivo:** " + ", ".join(st.session_state.keywords))
    else:
        st.caption("🔎 **Keywords objetivo:** (ninguna — añade hasta 5 para ver la relevancia específica)")

    # --- Metadatos
    if st.session_state.meta_result.get("status") == "error":
        st.warning(f"Metadatos: {st.session_state.meta_result.get('error')}")
    st.subheader("Metadatos (semáforo)")
    render_metadata_cards(st.session_state.meta_result, on_add=add_task_to_plan)

    # Relevancia por keyword en metadatos (si aplica)
    if st.session_state.keywords:
        render_kw_relevance_meta(st.session_state.meta_result)
    else:
        st.info("Añade keywords para evaluar su presencia en <title>, meta description, H1/H2 y slug.")

    # --- Social
    if st.session_state.social_result.get("status") == "error":
        st.warning(f"Social: {st.session_state.social_result.get('error')}")
    st.subheader("Checklist Social (OG/Twitter)")
    render_social_cards(st.session_state.social_result, on_add=add_task_to_plan)

    # Relevancia por keyword en social (si aplica)
    if st.session_state.keywords:
        render_kw_relevance_social(st.session_state.social_result)
    else:
        st.info("Añade keywords para evaluar su presencia en og:title/description y twitter:title/description.")

    # --- WPO
    if st.session_state.perf_result.get("status") == "error":
        st.warning(f"WPO: {st.session_state.perf_result.get('error')}")
    st.subheader("Rendimiento rápido (mini WPO)")
    render_perf_cards(st.session_state.perf_result, on_add=add_task_to_plan)

    # --- Indexabilidad
    if st.session_state.crawl_result.get("status") == "error":
        st.warning(f"Indexabilidad: {st.session_state.crawl_result.get('error')}")
    st.subheader("Rastreo e indexabilidad (cabeceras/redirects)")
    render_crawl_grid(st.session_state.crawl_result, on_add=add_task_to_plan)

    # --- Encabezados detalle
    st.subheader("Metadatos y encabezados (detalle)")
    render_headings_table(st.session_state.headings_detail)

    # --- Sugerencias
    st.subheader("Sugerencias (agrega al plan con un clic)")
    render_suggestions_board(st.session_state.suggestions, on_add=add_task_to_plan)

    # --- IA: Configuración rápida ---
    st.markdown("---")
    with st.expander("⚙️ Opciones de IA (opcional)"):
        st.session_state.ia_brand = st.text_input("Marca (para los copys, opcional)", value=st.session_state.ia_brand)
        cta1, cta2 = st.columns(2)
        with cta1:
            st.session_state.ia_tone_actions = st.selectbox(
                "Tono para sugerencias/acciones",
                ["profesional-directo", "consultivo", "conciso", "didáctico"],
                index=["profesional-directo", "consultivo", "conciso", "didáctico"].index(st.session_state.ia_tone_actions)
            )
        with cta2:
            st.session_state.ia_tone_copy = st.selectbox(
                "Tono para titles/meta/H1/H2",
                ["claro-atractivo", "formal", "informal", "comercial"],
                index=["claro-atractivo", "formal", "informal", "comercial"].index(st.session_state.ia_tone_copy)
            )

    # --- IA: Acciones y Copy ---
    c_ia1, c_ia2 = st.columns([1, 1])

    with c_ia1:
        if st.button("➕ Enriquecer plan con IA", use_container_width=True):
            if not st.session_state.keywords:
                st.warning("Añade al menos 1 keyword para priorizar bien las acciones.")
            try:
                with st.spinner("Generando tareas con IA..."):
                    tasks = ai_suggest_actions(
                        url=st.session_state.url,
                        keywords=st.session_state.keywords,
                        meta=st.session_state.meta_result,
                        social=st.session_state.social_result,
                        perf=st.session_state.perf_result,
                        crawl=st.session_state.crawl_result,
                        headings=st.session_state.headings_detail,
                        tone=st.session_state.ia_tone_actions,
                    )
                    for t in tasks:
                        add_task_to_plan(t)
                toast_success("Plan enriquecido con IA ✅")
            except Exception as e:
                st.error(f"Error al generar acciones con IA: {e}")

    with c_ia2:
        if st.button("✍️ Propuestas de Title/Meta/H1/H2 (IA)", use_container_width=True):
            try:
                with st.spinner("Generando propuestas de copy..."):
                    props = ai_rewrite_elements(
                        keywords=st.session_state.keywords,
                        brand=(st.session_state.ia_brand or None),
                        meta=st.session_state.meta_result,
                        max_variants=3,
                        tone=st.session_state.ia_tone_copy,
                    )
                st.session_state.ia_copy_props = props
                st.success("Propuestas generadas (ver debajo).")
            except Exception as e:
                st.error(f"Error al generar copys con IA: {e}")

    # Mostrar propuestas de IA (si existen)
    props = st.session_state.get("ia_copy_props")
    if props:
        st.subheader("Propuestas de copy (IA)")
        if props.get("titles"):
            st.write("**Titles**:")
            for i, t in enumerate(props.get("titles"), start=1):
                st.write(f"{i}. {t}")
        if props.get("descriptions"):
            st.write("**Meta descriptions**:")
            for i, d in enumerate(props.get("descriptions"), start=1):
                st.write(f"{i}. {d}")
        if props.get("h1"):
            st.write("**H1**:")
            for i, h in enumerate(props.get("h1"), start=1):
                st.write(f"{i}. {h}")
        if props.get("h2"):
            st.write("**H2**:")
            for i, h in enumerate(props.get("h2"), start=1):
                st.write(f"{i}. {h}")

def render_plan():
    st.session_state.plan_df = ensure_plan_schema(st.session_state.plan_df)

    st.caption("Tabla editable. Puedes escribir directamente en las celdas.")
    edited = st.data_editor(
        st.session_state.plan_df,
        num_rows="dynamic",
        use_container_width=True,
        column_config={
            "Prioridad": st.column_config.SelectboxColumn(options=["Alta", "Media", "Baja"]),
            "Categoría": st.column_config.SelectboxColumn(options=["On-Page", "Social", "WPO", "Indexabilidad", "Otros"]),
            "Impacto": st.column_config.SelectboxColumn(options=["Alto", "Medio", "Bajo"]),
            "Esfuerzo": st.column_config.SelectboxColumn(options=["Alto", "Medio", "Bajo"]),
            "Estado": st.column_config.SelectboxColumn(options=["Pendiente", "En curso", "Hecho"]),
            "Fecha objetivo": st.column_config.DateColumn(format="YYYY-MM-DD"),
        },
        key="plan_editor"
    )
    st.session_state.plan_df = ensure_plan_schema(edited)

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        if st.button("Plantilla básica", use_container_width=True):
            base_rows = [
                {"Prioridad": "Alta", "Categoría": "On-Page", "Tarea": "Optimizar título a 30–60 caracteres", "Responsable": "", "Impacto": "Alto", "Esfuerzo": "Bajo", "Estado": "Pendiente", "Fecha objetivo": pd.NaT, "Notas": ""},
                {"Prioridad": "Media", "Categoría": "Social", "Tarea": "Definir og:title/description/image coherentes", "Responsable": "", "Impacto": "Medio", "Esfuerzo": "Bajo", "Estado": "Pendiente", "Fecha objetivo": pd.NaT, "Notas": ""},
                {"Prioridad": "Alta", "Categoría": "WPO", "Tarea": "Reducir TTFB por debajo de 300 ms", "Responsable": "", "Impacto": "Alto", "Esfuerzo": "Medio", "Estado": "Pendiente", "Fecha objetivo": pd.NaT, "Notas": "Revisar hosting y caché"},
            ]
            st.session_state.plan_df = ensure_plan_schema(
                pd.concat([st.session_state.plan_df, pd.DataFrame(base_rows)], ignore_index=True)
            )
            toast_success("Plantilla cargada ✅")

    with c2:
        up = st.file_uploader("Importar plan (CSV/JSON)", type=["csv", "json"], label_visibility="collapsed")
        if up is not None:
            import_plan(up)

    with c3:
        csv_bytes, csv_name, csv_mime = export_plan("CSV")
        st.download_button("Exportar CSV", data=csv_bytes, file_name=csv_name, mime=csv_mime, use_container_width=True)

    with c4:
        json_bytes, json_name, json_mime = export_plan("JSON")
        st.download_button("Exportar JSON", data=json_bytes, file_name=json_name, mime=json_mime, use_container_width=True)

def render_reporte():
    if not st.session_state.meta_result:
        st.info("Genera primero una auditoría para poder crear el reporte.")
        return

    # --- IA: Resumen ejecutivo (opcional) ---
    if st.button("🧠 Generar resumen ejecutivo (IA)", use_container_width=True):
        try:
            with st.spinner("Creando resumen ejecutivo..."):
                plan_records = ensure_plan_schema(st.session_state.plan_df).to_dict(orient="records")
                # 1) Intento primario: servicio centralizado
                summary_html = ai_exec_summary(
                    url=st.session_state.url,
                    keywords=st.session_state.keywords,
                    meta=st.session_state.meta_result,
                    social=st.session_state.social_result,
                    perf=st.session_state.perf_result,
                    crawl=st.session_state.crawl_result,
                    plan_df_records=plan_records
                )
                # 2) Fallback local si el servicio no devuelve nada
                if not summary_html:
                    summary_html = generate_exec_summary_fallback(
                        url=st.session_state.url,
                        keywords=st.session_state.keywords,
                        meta=st.session_state.meta_result,
                        social=st.session_state.social_result,
                        perf=st.session_state.perf_result,
                        crawl=st.session_state.crawl_result,
                        headings=st.session_state.headings_detail,
                    )
                # post-procesado para convertir "Impacto/Esfuerzo" en píldoras
                summary_html = postprocess_ia_summary(summary_html)
                st.session_state.ia_report_summary_html = summary_html
            st.success("Resumen creado.")
        except Exception as e:
            # Si falla todo, intentamos fallback igualmente
            try:
                summary_html = generate_exec_summary_fallback(
                    url=st.session_state.url,
                    keywords=st.session_state.keywords,
                    meta=st.session_state.meta_result,
                    social=st.session_state.social_result,
                    perf=st.session_state.perf_result,
                    crawl=st.session_state.crawl_result,
                    headings=st.session_state.headings_detail,
                )
                summary_html = postprocess_ia_summary(summary_html)
                st.session_state.ia_report_summary_html = summary_html
                if summary_html:
                    st.warning("Se utilizó el fallback local para generar el resumen.")
                else:
                    st.error(f"No se pudo generar el resumen: {e}")
            except Exception as e2:
                st.error(f"No se pudo generar el resumen (fallback): {e2}")

    if st.session_state.ia_report_summary_html:
        st.markdown("### Resumen ejecutivo (IA)")
        st.components.v1.html(st.session_state.ia_report_summary_html, height=360, scrolling=True)

    # --- Reporte HTML estándar ---
    html = build_html_report(
        url=st.session_state.url,
        audited_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
        meta=st.session_state.meta_result,
        social=st.session_state.social_result,
        perf=st.session_state.perf_result,
        crawl=st.session_state.crawl_result,
        headings=st.session_state.headings_detail,
        plan_df=st.session_state.plan_df,
        logo_data_uri=st.session_state.logo_data_uri,
        ia_summary_html=st.session_state.ia_report_summary_html,  # ← pasa el bloque IA al reporte
    )

    st.components.v1.html(html, height=900, scrolling=True)

    st.download_button(
        "Descargar reporte (HTML)",
        data=html.encode("utf-8"),
        file_name="reporte_opun_seo_lite.html",
        mime="text/html",
        use_container_width=True
    )
    st.caption("💡 Consejo: abre el HTML y usa **Imprimir → Guardar como PDF** para entregar al cliente.")

def main():
    st.set_page_config(page_title=APP_TITLE, page_icon="🔎", layout="wide")
    inject_base_css()

    # Inicializa estado ANTES del header (para logo)
    init_state()
    logo_arg = st.session_state.logo_data_uri or (LOGO_PATH if os.path.exists(LOGO_PATH) else None)
    header_bar(APP_TITLE, logo_path=logo_arg)

    tab = st.tabs(TABS)
    with tab[0]:
        render_auditoria()
    with tab[1]:
        render_plan()
    with tab[2]:
        render_reporte()

if __name__ == "__main__":
    main()
