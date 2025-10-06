# opun_seo_lite/ui_components.py
import streamlit as st
from typing import Dict, List, Optional
import pandas as pd

# =========================
# Estilos base (CSS)
# =========================
def inject_base_css() -> None:
    st.markdown(
        """
        <style>
        :root{
          --card-bg:#ffffff;
          --card-border:#ebeef3;
          --muted:#6b7280;
          --green:#16a34a;
          --amber:#f59e0b;
          --red:#ef4444;
          --chip-bg:#f3f4f6;
        }
        .op-header{
          display:flex; align-items:center; gap:.8rem;
          padding:.75rem 0 1rem 0; border-bottom:1px solid var(--card-border);
          margin-bottom:1rem;
        }
        .op-brand{ display:flex; align-items:center; gap:.8rem; }
        .op-logo{
          width:40px; height:40px; border-radius:8px; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
          border:1px solid var(--card-border); background:#0f172a;
        }
        .op-badge{
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.20rem .55rem; border-radius:999px; font-size:.80rem;
          background:var(--chip-bg); color:#111827; border:1px solid var(--card-border);
        }
        .op-chip{
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.18rem .5rem; border-radius:999px; font-size:.78rem;
          border:1px solid var(--card-border);
        }
        .chip-green{background:#ecfdf5; color:#065f46; border-color:#a7f3d0;}
        .chip-amber{background:#fffbeb; color:#92400e; border-color:#fde68a;}
        .chip-red{background:#fef2f2; color:#991b1b; border-color:#fecaca;}
        .op-card{
          background:var(--card-bg); border:1px solid var(--card-border);
          border-radius:14px; padding:14px; margin-bottom:12px;
          box-shadow:0 1px 2px rgba(0,0,0,0.03);
        }
        .op-grid{ display:grid; grid-template-columns:repeat(12,1fr); gap:12px; }
        .col-4{grid-column:span 4;} .col-6{grid-column:span 6;} .col-12{grid-column:span 12;}
        .muted{color:var(--muted); font-size:.9rem;}
        .op-item{
          display:flex; justify-content:space-between; align-items:center; gap:8px;
          padding:10px 12px; border:1px dashed var(--card-border); border-radius:12px;
          background:#fafafa;
        }
        .op-title{font-weight:600; font-size:1rem;}
        .op-kpi{font-size:1.05rem; font-weight:700;}
        .op-btn{
          display:inline-block; padding:.35rem .65rem; border-radius:8px;
          border:1px solid var(--card-border); background:#111827; color:#fff; font-size:.86rem;
        }
        .legend{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:8px; }
        .legend .chip-green, .legend .chip-amber, .legend .chip-red {font-weight:600;}
        .tiny{font-size:.8rem;}
        .wrap{white-space:pre-wrap; word-break:break-word;}
        </style>
        """,
        unsafe_allow_html=True,
    )

# =========================
# Helpers visuales
# =========================
def _status_chip(status: str, label: str = "") -> str:
    status = (status or "").lower()
    cls = "chip-green" if status == "green" else "chip-amber" if status == "amber" else "chip-red"
    txt = label or status.capitalize()
    return f'<span class="op-chip {cls}">{txt}</span>'

def _kv(title: str, value: str, status: Optional[str] = None) -> None:
    chip = _status_chip(status) if status else ""
    st.markdown(
        f"""
        <div class="op-item">
          <div class="op-title">{title}</div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="op-kpi">{value}</div>
            {chip}
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

def header_bar(app_title: str, logo_path: Optional[str] = None, subtitle: str = "Auditoría On-Page y técnica ligera") -> None:
    left, right = st.columns([1, 4])
    with left:
        if logo_path:
            try:
                st.markdown('<div class="op-logo">', unsafe_allow_html=True)
                st.image(logo_path, use_container_width=True)
                st.markdown('</div>', unsafe_allow_html=True)
            except Exception:
                st.markdown('<div class="op-logo"></div>', unsafe_allow_html=True)
        else:
            st.markdown('<div class="op-logo"></div>', unsafe_allow_html=True)
    with right:
        st.markdown(
            f"""
            <div class="op-header">
              <div class="op-brand">
                <h1 style="margin:0;">{app_title}</h1>
                <span class="op-badge">v1.0</span>
              </div>
              <span class="muted">{subtitle}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

def legend_block() -> None:
    st.markdown(
        """
        <div class="legend">
          <span class="op-chip chip-green">🟢 Bueno</span>
          <span class="op-chip chip-amber">🟠 Mejorable</span>
          <span class="op-chip chip-red">🔴 Crítico</span>
          <span class="muted tiny">Pasa el ratón sobre iconos y textos para ver definiciones.</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

def toast_success(msg: str) -> None:
    try:
        st.toast(msg, icon="✅")
    except Exception:
        st.success(msg)

# =========================
# Render: Metadatos (semáforo)
# =========================
def render_metadata_cards(meta: Dict, on_add=None) -> None:
    if not meta:
        st.info("Sin datos de metadatos.")
        return

    cols = st.columns(3)
    with cols[0]:
        _card_meta(
            title="Título",
            value=meta["title"]["value"],
            extra=f"Longitud: {meta['title']['len']} caracteres",
            status=meta["title"]["status"],
            on_add=on_add,
            tarea="Optimizar <title> a 30–60 caracteres, incluyendo marca y palabra clave principal.",
            categoria="On-Page",
            prioridad="Alta",
            impacto="Alto",
            esfuerzo="Bajo",
            nota=f"Longitud actual: {meta['title']['len']}",
        )
    with cols[1]:
        _card_meta(
            title="Meta description",
            value=meta["description"]["value"],
            extra=f"Longitud: {meta['description']['len']} caracteres",
            status=meta["description"]["status"],
            on_add=on_add,
            tarea="Ajustar meta description a 70–160 caracteres con propuesta de valor y CTA.",
            categoria="On-Page",
            prioridad="Media",
            impacto="Medio",
            esfuerzo="Bajo",
            nota=f"Longitud actual: {meta['description']['len']}",
        )
    with cols[2]:
        _card_meta(
            title="Canonical",
            value=meta["canonical"]["value"] or "—",
            extra="Debe ser URL absoluta (https://…) y única",
            status=meta["canonical"]["status"],
            on_add=on_add,
            tarea="Añadir/normalizar canonical absoluta apuntando a la URL canónica.",
            categoria="On-Page",
            prioridad="Media",
            impacto="Medio",
            esfuerzo="Bajo",
            nota=meta["canonical"]["value"] or "Sin canonical",
        )

    cols2 = st.columns(3)
    with cols2[0]:
        _card_meta(
            title="Robots (meta)",
            value=meta["robots_meta"]["value"] or "—",
            extra="En producción debería ser index,follow (o vacío).",
            status=meta["robots_meta"]["status"],
            on_add=on_add,
            tarea="Revisar meta robots (evitar noindex/nofollow en producción).",
            categoria="Indexabilidad",
            prioridad="Alta",
            impacto="Alto",
            esfuerzo="Bajo",
            nota=meta["robots_meta"]["value"] or "—",
        )
    with cols2[1]:
        _card_kpi("HTTP Status", str(meta.get("http_status", "—")), None)
    with cols2[2]:
        _card_kpi("Content-Type", meta.get("content_type") or "—", None)

def _card_meta(title: str, value: str, extra: str, status: str, on_add, **task_defaults) -> None:
    with st.container():
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown(f"**{title}** {_status_chip(status)}", unsafe_allow_html=True)
        st.markdown(f"<div class='muted tiny'>{extra}</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='wrap' style='margin-top:.35rem'>{value or '—'}</div>", unsafe_allow_html=True)
        c1, c2 = st.columns([1, 1])
        with c1:
            if st.button("➕ Agregar al plan", key=f"add_{title}", use_container_width=True):
                if on_add:
                    on_add({
                        "tarea": task_defaults.get("tarea", title),
                        "categoria": task_defaults.get("categoria", "On-Page"),
                        "prioridad": task_defaults.get("prioridad", "Media"),
                        "impacto": task_defaults.get("impacto", "Medio"),
                        "esfuerzo": task_defaults.get("esfuerzo", "Bajo"),
                        "nota": task_defaults.get("nota", ""),
                    })
        with c2:
            st.caption("")
        st.markdown("</div>", unsafe_allow_html=True)

def _card_kpi(title: str, value: str, status: Optional[str]) -> None:
    st.markdown('<div class="op-card">', unsafe_allow_html=True)
    chip = _status_chip(status) if status else ""
    st.markdown(
        f"<div class='op-item'><div class='op-title'>{title}</div><div class='op-kpi'>{value}</div>{chip}</div>",
        unsafe_allow_html=True,
    )
    st.markdown("</div>", unsafe_allow_html=True)

# =========================
# Render: Social (OG/Twitter)
# =========================
def render_social_cards(social: Dict, on_add=None) -> None:
    if not social:
        st.info("Sin datos sociales.")
        return

    cols = st.columns(2)
    with cols[0]:
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown(f"**Open Graph** {_status_chip(social['og']['status'])}", unsafe_allow_html=True)
        _pair_list({
            "og:title": social["og"].get("og:title") or "—",
            "og:description": social["og"].get("og:description") or "—",
            "og:image": social["og"].get("og:image") or "—",
            "og:type": social["og"].get("og:type") or "—",
            "og:url": social["og"].get("og:url") or "—",
            "og:site_name": social["og"].get("og:site_name") or "—",
        })
        if st.button("➕ Agregar al plan (OG)", use_container_width=True, key="add_og"):
            if on_add:
                on_add({
                    "tarea": "Completar etiquetas Open Graph esenciales (og:title, og:description, og:image).",
                    "categoria": "Social", "prioridad": "Media", "impacto": "Medio", "esfuerzo": "Bajo",
                    "nota": "Revisar coherencia con title/description."
                })
        st.markdown("</div>", unsafe_allow_html=True)

    with cols[1]:
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown(f"**Twitter** {_status_chip(social['twitter']['status'])}", unsafe_allow_html=True)
        _pair_list({
            "twitter:card": social["twitter"].get("twitter:card") or "—",
            "twitter:title": social["twitter"].get("twitter:title") or "—",
            "twitter:description": social["twitter"].get("twitter:description") or "—",
            "twitter:image": social["twitter"].get("twitter:image") or "—",
        })
        if st.button("➕ Agregar al plan (Twitter)", use_container_width=True, key="add_twitter"):
            if on_add:
                on_add({
                    "tarea": "Definir Twitter Card (summary o summary_large_image) con título, descripción e imagen.",
                    "categoria": "Social", "prioridad": "Media", "impacto": "Medio", "esfuerzo": "Bajo",
                    "nota": "Compatibilizar con OG."
                })
        st.markdown("</div>", unsafe_allow_html=True)

    if social.get("preview_image"):
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown("**Vista previa de imagen social**", unsafe_allow_html=True)
        st.image(social["preview_image"], use_column_width=True, caption=social["preview_image"])
        st.markdown("</div>", unsafe_allow_html=True)

def _pair_list(data: Dict[str, str]) -> None:
    for k, v in data.items():
        st.markdown(
            f"""
            <div class="op-item">
              <div class="op-title">{k}</div>
              <div class="wrap" style="max-width:70%;">{v}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

# =========================
# Render: Rendimiento (mini WPO)
# =========================
def render_perf_cards(perf: Dict, on_add=None) -> None:
    if not perf:
        st.info("Sin datos de rendimiento.")
        return

    cols = st.columns(4)
    with cols[0]:
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown("**TTFB**", unsafe_allow_html=True)
        _kv("Tiempo hasta primer byte", f"{perf['ttfb_ms']} ms", perf["ttfb_status"])
        if st.button("➕ Agregar al plan (TTFB)", use_container_width=True, key="add_ttfb"):
            if on_add:
                on_add({
                    "tarea": "Reducir TTFB por debajo de 300 ms (caché, edge, backend/DB, hosting).",
                    "categoria": "WPO", "prioridad": "Alta", "impacto": "Alto", "esfuerzo": "Medio",
                    "nota": f"TTFB actual: {perf['ttfb_ms']} ms"
                })
        st.markdown("</div>", unsafe_allow_html=True)

    with cols[1]:
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown("**Peso HTML**", unsafe_allow_html=True)
        _kv("Tamaño del HTML", perf["html_size_readable"], None)
        st.markdown("</div>", unsafe_allow_html=True)

    with cols[2]:
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown("**Imágenes**", unsafe_allow_html=True)
        _kv("# Imágenes en HTML", str(perf["num_images"]), None)
        if perf["num_images"] > 15 and on_add:
            if st.button("➕ Agregar al plan (Imágenes)", use_container_width=True, key="add_imgs"):
                on_add({
                    "tarea": "Optimizar número/peso de imágenes (lazy-load, formatos modernos).",
                    "categoria": "WPO", "prioridad": "Baja", "impacto": "Medio", "esfuerzo": "Medio",
                    "nota": f"Detectadas: {perf['num_images']}"
                })
        st.markdown("</div>", unsafe_allow_html=True)

    with cols[3]:
        st.markdown('<div class="op-card">', unsafe_allow_html=True)
        st.markdown("**Caché & Compresión**", unsafe_allow_html=True)
        _kv("Compresión (gzip/br)", "Sí" if perf["compression"]["value"] else "No", perf["compression"]["status"])
        _kv("Cache-Control", perf["cache_control"]["value"] or "—", perf["cache_control"]["status"])
        if st.button("➕ Agregar al plan (Caché/Compresión)", use_container_width=True, key="add_cache"):
            if on_add:
                on_add({
                    "tarea": "Habilitar compresión y políticas de Cache-Control en estáticos.",
                    "categoria": "WPO", "prioridad": "Media", "impacto": "Medio", "esfuerzo": "Bajo",
                    "nota": f"Cache-Control: {perf['cache_control']['value'] or 'no definido'}"
                })
        st.markdown("</div>", unsafe_allow_html=True)

# =========================
# Render: Rastreo e indexabilidad
# =========================
def render_crawl_grid(crawl: Dict, on_add=None) -> None:
    if not crawl:
        st.info("Sin datos de rastreo.")
        return

    st.markdown('<div class="op-grid">', unsafe_allow_html=True)

    # Cadena de redirects
    st.markdown('<div class="op-card col-6">', unsafe_allow_html=True)
    st.markdown(f"**Cadena de redirecciones** {_status_chip(crawl['chain_status'])}", unsafe_allow_html=True)
    if crawl["redirect_chain"]:
        for (status, url) in crawl["redirect_chain"]:
            _kv(url, str(status))
    else:
        _kv("Sin redirecciones", "—", "green")
    _kv("Estado final", str(crawl["final_status"]), "green" if crawl["final_status"] == 200 else "red")
    if st.button("➕ Agregar al plan (Redirects)", use_container_width=True, key="add_redirects"):
        if on_add:
            on_add({
                "tarea": "Reducir cadena de redirecciones (ideal 0, máximo 1 hop).",
                "categoria": "Indexabilidad", "prioridad": "Alta", "impacto": "Alto", "esfuerzo": "Medio",
                "nota": f"Hops: {len(crawl['redirect_chain'])}, estado final: {crawl['final_status']}"
            })
    st.markdown('</div>', unsafe_allow_html=True)

    # Cabeceras clave
    st.markdown('<div class="op-card col-6">', unsafe_allow_html=True)
    st.markdown("**Cabeceras clave**", unsafe_allow_html=True)
    for h in crawl["headers"]:
        _kv(h["key"], h["value"] or "—")
    xrt = crawl.get("x_robots_tag") or ""
    _kv("x-robots-tag", xrt or "—", "red" if ("noindex" in xrt) else None)
    if st.button("➕ Agregar al plan (Cabeceras)", use_container_width=True, key="add_headers"):
        if on_add:
            on_add({
                "tarea": "Revisar cabeceras (x-robots, cache-control, content-encoding…).",
                "categoria": "Indexabilidad", "prioridad": "Media", "impacto": "Medio", "esfuerzo": "Bajo",
                "nota": "Ajustar según mejores prácticas."
            })
    st.markdown('</div>', unsafe_allow_html=True)

    # Robots / Sitemap
    st.markdown('<div class="op-card col-6">', unsafe_allow_html=True)
    st.markdown("**robots.txt**", unsafe_allow_html=True)
    _kv("Declarado", crawl["robots_info"].get("declared") or "—")
    _kv("Accesible", "Sí" if crawl["robots_info"].get("ok") else "No")
    _kv("URL final", crawl["robots_info"].get("final_url") or "—")
    _kv("Status", str(crawl["robots_info"].get("status") or "—"))
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('<div class="op-card col-6">', unsafe_allow_html=True)
    st.markdown("**sitemap.xml**", unsafe_allow_html=True)
    _kv("Declarado", crawl["sitemap_info"].get("declared") or "—")
    _kv("Accesible", "Sí" if crawl["sitemap_info"].get("ok") else "No")
    _kv("URL final", crawl["sitemap_info"].get("final_url") or "—")
    _kv("Status", str(crawl["sitemap_info"].get("status") or "—"))
    if st.button("➕ Agregar al plan (robots/sitemap)", use_container_width=True, key="add_rs"):
        if on_add:
            on_add({
                "tarea": "Declarar sitemap.xml y referenciarlo en robots.txt.",
                "categoria": "Indexabilidad", "prioridad": "Media", "impacto": "Medio", "esfuerzo": "Bajo",
                "nota": "Verificar acceso."
            })
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)

# =========================
# Render: Metadatos y encabezados (detalle)
# =========================
def render_headings_table(detail: Dict) -> None:
    if not detail:
        st.info("Sin detalle de encabezados.")
        return

    st.markdown('<div class="op-card">', unsafe_allow_html=True)
    st.markdown("**Detalle de metadatos y encabezados**", unsafe_allow_html=True)

    st.write("**Título:**", detail.get("title") or "—")
    st.write("**Meta description:**", detail.get("meta_description") or "—")
    st.write("**Robots meta:**", detail.get("robots_meta") or "—")
    st.write("**Canonical:**", detail.get("canonical") or "—")

    c1, c2, c3 = st.columns(3)
    with c1:
        st.write("**H1**")
        st.dataframe({"H1": detail.get("h1", [])}, use_container_width=True, hide_index=True)
    with c2:
        st.write("**H2 (top)**")
        st.dataframe({"H2": detail.get("h2", [])}, use_container_width=True, hide_index=True)
    with c3:
        st.write("**H3 (top)**")
        st.dataframe({"H3": detail.get("h3", [])}, use_container_width=True, hide_index=True)

    st.markdown('</div>', unsafe_allow_html=True)

# =========================
# Render: Sugerencias (board)
# =========================
def render_suggestions_board(suggestions: List[Dict], on_add=None) -> None:
    if not suggestions:
        st.info("No hay recomendaciones generadas. Ajusta la URL o revisa otras secciones.")
        return

    st.markdown('<div class="op-grid">', unsafe_allow_html=True)
    for i, s in enumerate(suggestions):
        st.markdown('<div class="op-card col-6">', unsafe_allow_html=True)
        st.markdown(f"**{s.get('tarea','Tarea')}**", unsafe_allow_html=True)
        meta = f"Prioridad: {s.get('prioridad','-')} · Impacto: {s.get('impacto','-')} · Esfuerzo: {s.get('esfuerzo','-')} · Categoría: {s.get('categoria','-')}"
        st.markdown(f"<div class='muted tiny'>{meta}</div>", unsafe_allow_html=True)
        if s.get("nota"):
            st.markdown(f"<div class='wrap tiny' style='margin-top:.35rem'><b>Nota:</b> {s['nota']}</div>", unsafe_allow_html=True)
        if st.button("➕ Agregar al plan", key=f"add_sug_{i}", use_container_width=True):
            if on_add:
                on_add(s)
        st.markdown('</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

# =========================
# Relevancia por keywords (enriquecida)
# =========================
def _kw_block_to_df_meta(kw_rel: dict) -> pd.DataFrame:
    by_kw = kw_rel.get("by_keyword") or {}
    if by_kw:
        rows = []
        for kw, d in by_kw.items():
            rows.append({
                "Keyword": kw,
                "Score (0–100)": d.get("score", 0),
                "Title": d.get("title", {}).get("match", "none"),
                "Meta": d.get("meta_description", {}).get("match", "none"),
                "H1": d.get("h1", {}).get("match", "none"),
                "H2": d.get("h2", {}).get("match", "none"),
                "Slug": d.get("url_slug", {}).get("match", "none"),
                "Densidad": d.get("density", {}).get("value", 0.0),
            })
        return pd.DataFrame(rows).sort_values(by="Score (0–100)", ascending=False)

    # Fallback legacy
    items = kw_rel.get("keywords") or []
    rows = []
    for it in items:
        rows.append({
            "Keyword": it.get("kw", ""),
            "Score (legacy)": it.get("kw_score", 0),
            "Title": "yes" if it.get("in_title") else "no",
            "Meta": "yes" if it.get("in_description") else "no",
            "H1": "yes" if it.get("in_h1") else "no",
            "H2": "yes" if it.get("in_h2") else "no",
        })
    return pd.DataFrame(rows)

def render_kw_relevance_meta(meta_result: dict) -> None:
    if not isinstance(meta_result, dict):
        return
    kw_rel = meta_result.get("keyword_relevance") or {}
    if not kw_rel or (not kw_rel.get("by_keyword") and not kw_rel.get("keywords")):
        return

    st.markdown("### Relevancia por keywords (Metadatos)")
    overall = kw_rel.get("overall_score")
    if overall is not None:
        st.progress(min(max(int(overall), 0), 100), text=f"Overall META: {overall}/100")

    df = _kw_block_to_df_meta(kw_rel)
    if not df.empty:
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("No hay datos de relevancia por keywords (Meta).")

def _kw_block_to_df_social(kw_rel: dict) -> pd.DataFrame:
    by_kw = (kw_rel or {}).get("by_keyword") or {}
    if by_kw:
        rows = []
        for kw, d in by_kw.items():
            og = d.get("og", {})
            tw = d.get("twitter", {})
            rows.append({
                "Keyword": kw,
                "Score (0–100)": d.get("score", 0),
                "og:title": og.get("title", {}).get("match", "none"),
                "og:description": og.get("description", {}).get("match", "none"),
                "tw:title": tw.get("title", {}).get("match", "none"),
                "tw:description": tw.get("description", {}).get("match", "none"),
            })
        return pd.DataFrame(rows).sort_values(by="Score (0–100)", ascending=False)

    # Fallback legacy
    items = (kw_rel or {}).get("keywords") or []
    rows = []
    for it in items:
        rows.append({
            "Keyword": it.get("kw", ""),
            "Score (legacy)": it.get("kw_score", 0),
            "og:title": "yes" if it.get("in_og_title") else "no",
            "og:description": "yes" if it.get("in_og_description") else "no",
            "tw:title": "yes" if it.get("in_tw_title") else "no",
            "tw:description": "yes" if it.get("in_tw_description") else "no",
        })
    return pd.DataFrame(rows)

def render_kw_relevance_social(social_result: dict) -> None:
    if not isinstance(social_result, dict):
        return
    kw_rel = social_result.get("keyword_relevance") or {}
    if not kw_rel or (not kw_rel.get("by_keyword") and not kw_rel.get("keywords")):
        return

    st.markdown("### Relevancia por keywords (Social)")
    overall = kw_rel.get("overall_score")
    if overall is not None:
        st.progress(min(max(int(overall), 0), 100), text=f"Overall SOCIAL: {overall}/100")

    df = _kw_block_to_df_social(kw_rel)
    if not df.empty:
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("No hay datos de relevancia por keywords (Social).")
