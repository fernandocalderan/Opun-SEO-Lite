# opun_seo_lite/report_builder.py
from typing import Dict, Optional, List
import html
import pandas as pd

def _esc(x: str) -> str:
    return html.escape(str(x or ""))

def _chip(status: str) -> str:
    s = (status or "").lower()
    color = {"green": "#16a34a", "amber": "#f59e0b", "red": "#ef4444"}.get(s, "#6b7280")
    label = {"green": "Bueno", "amber": "Mejorable", "red": "Crítico"}.get(s, s.capitalize() or "—")
    bg = {"green": "#ecfdf5", "amber": "#fffbeb", "red": "#fef2f2"}.get(s, "#f3f4f6")
    border = {"green": "#a7f3d0", "amber": "#fde68a", "red": "#fecaca"}.get(s, "#e5e7eb")
    return f'<span style="display:inline-block;padding:.2rem .6rem;border-radius:999px;border:1px solid {border};background:{bg};color:{color};font-weight:600;font-size:.8rem;">{label}</span>'

def _krow(k: str, v: str, status: str = None) -> str:
    chip = _chip(status) if status else ""
    return f"""
    <tr>
      <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;width:32%;font-weight:600;">{_esc(k)}</td>
      <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{_esc(v)}</td>
      <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;width:140px;text-align:right;">{chip}</td>
    </tr>
    """

def _section(title: str, body_html: str) -> str:
    return f"""
    <section style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin:14px 0;box-shadow:0 1px 2px rgba(0,0,0,.03);">
      <h2 style="margin:0 0 .5rem 0;font-size:1.15rem;">{_esc(title)}</h2>
      {body_html}
    </section>
    """

def _legend() -> str:
    return f"""
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:.25rem 0 1rem 0;">
      {_chip("green")}
      {_chip("amber")}
      {_chip("red")}
      <span style="color:#6b7280;font-size:.85rem;">Guía de estado: Bueno · Mejorable · Crítico</span>
    </div>
    """

def _table(rows_html: str, min_width: int = 480) -> str:
    return f"""
    <div style="overflow:auto;">
      <table style="border-collapse:collapse;width:100%;min-width:{min_width}px;">{rows_html}</table>
    </div>
    """

def _yn(ok: bool) -> str:
    """Chip Sí/No compacto para tablas de keyword relevance."""
    if ok:
        return '<span style="display:inline-block;padding:.15rem .45rem;border-radius:999px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-weight:600;font-size:.75rem;">Sí</span>'
    return '<span style="display:inline-block;padding:.15rem .45rem;border-radius:999px;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-weight:600;font-size:.75rem;">No</span>'

def _progress(label: str, value: int) -> str:
    """Barra de progreso simple 0..100."""
    clamped = max(0, min(int(value or 0), 100))
    return f"""
    <div style="margin:.5rem 0 .75rem 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="font-weight:600;">{_esc(label)}</div>
        <div style="color:#374151;font-weight:700;">{clamped}/100</div>
      </div>
      <div style="height:10px;border-radius:999px;background:#e5e7eb;overflow:hidden;">
        <div style="height:100%;width:{clamped}%;background:#16a34a;"></div>
      </div>
    </div>
    """

# ========= Wrapper profesional para el Resumen Ejecutivo (IA) =========
def _render_exec_summary_ia(ia_summary_html: str) -> str:
    if not ia_summary_html:
        return ""

    styles = """
    <style>
      .ia-card{border:1px solid #e5e7eb;border-radius:16px;padding:18px 20px;margin:8px 0;background:#fff;}
      .ia-hdr{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px}
      .ia-badge{font-size:12px;background:#eef2ff;color:#3730a3;border-radius:999px;padding:4px 10px;font-weight:600;letter-spacing:.2px}
      .ia-title{margin:0;font-size:20px;line-height:1.25}
      .ia-intro{margin:6px 0 2px 0;color:#4b5563;font-size:14px}
      .ia-body{font-size:14px;line-height:1.6;color:#111827}
      .ia-body h4{margin:14px 0 6px 0;font-size:15px}
      .ia-body ul{margin:6px 0 10px 18px}
      .ia-body li{margin:4px 0}
      .pill{display:inline-block;font-size:12px;border-radius:999px;padding:2px 8px;margin:0 6px 0 0;border:1px solid #e5e7eb}
      .pill.green{background:#ecfdf5;border-color:#10b98133;color:#065f46}
      .pill.amber{background:#fffbeb;border-color:#f59e0b33;color:#92400e}
      .pill.red{background:#fef2f2;border-color:#ef444433;color:#991b1b}
      .ia-foot{margin-top:12px;padding-top:10px;border-top:1px dashed #e5e7eb;color:#6b7280;font-size:12px}
      .kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:8px 0 4px}
      .kpi > div{border:1px solid #e5e7eb;border-radius:12px;padding:10px}
      .kpi .k{font-size:12px;color:#6b7280;margin-bottom:2px}
      .kpi .v{font-size:16px;font-weight:700}
    </style>
    """

    html_block = f"""
    {styles}
    <div class="ia-card">
      <div class="ia-hdr">
        <div class="ia-badge">Resumen ejecutivo</div>
        <h3 class="ia-title">Síntesis técnica en lenguaje claro</h3>
      </div>
      <p class="ia-intro">Panorama general del SEO del sitio, hallazgos clave y acciones priorizadas para mejorar visibilidad y negocio.</p>

      <!-- KPIs rápidos (opcional) -->
      <div class="kpi">
        <div><div class="k">Estado meta</div><div class="v"><span class="pill amber">Mejorable</span></div></div>
        <div><div class="k">Contenido & Relevancia</div><div class="v"><span class="pill amber">Mejorable</span></div></div>
        <div><div class="k">Arquitectura & Indexación</div><div class="v"><span class="pill green">Correcto</span></div></div>
        <div><div class="k">Rendimiento web</div><div class="v"><span class="pill red">Crítico</span></div></div>
      </div>

      <div class="ia-body">
        {ia_summary_html}
      </div>

      <div class="ia-foot">
        Nota: Este resumen se genera con IA a partir de los datos del análisis. Los términos técnicos se explican en lenguaje llano y las acciones se priorizan por impacto y esfuerzo estimado.
      </div>
    </div>
    """
    return _section("Resumen ejecutivo (IA)", html_block)

# -----------------------------
# Keyword tables (Meta + Social)
# Soportan bloque enriquecido (by_keyword/overall_score)
# y hacen fallback al esquema legacy (keywords/score).
# -----------------------------
def _kw_table_meta(meta_kw_block: Dict) -> str:
    """Tabla por keyword (Metadatos). Soporta enriquecido y legacy."""
    if not meta_kw_block:
        return '<p style="color:#6b7280;">No se proporcionaron keywords o no se detectó relevancia.</p>'

    by_kw = meta_kw_block.get("by_keyword") or {}
    overall = meta_kw_block.get("overall_score")
    legacy_items = meta_kw_block.get("keywords") or []
    legacy_total = meta_kw_block.get("score", 0)

    # Enriquecido
    if by_kw:
        thead = """
        <thead>
          <tr>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Keyword</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">&lt;title&gt;</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">meta description</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">H1</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">H2</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Slug</th>
            <th style="text-align:right;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Score</th>
          </tr>
        </thead>
        """
        body_rows: List[str] = []
        for kw, d in by_kw.items():
            tit = (d.get("title", {}) or {}).get("match", "none")
            des = (d.get("meta_description", {}) or {}).get("match", "none")
            h1  = (d.get("h1", {}) or {}).get("match", "none")
            h2  = (d.get("h2", {}) or {}).get("match", "none")
            slg = (d.get("url_slug", {}) or {}).get("match", "none")
            score = d.get("score", 0)
            def badge(m):
                m = (m or "none").lower()
                color = {"exact":"#16a34a","partial":"#f59e0b","none":"#ef4444"}.get(m,"#6b7280")
                bg = {"exact":"#ecfdf5","partial":"#fffbeb","none":"#fef2f2"}.get(m,"#f3f4f6")
                return f'<span style="display:inline-block;padding:.15rem .5rem;border-radius:999px;border:1px solid #e5e7eb;background:{bg};color:{color};font-weight:600;font-size:.75rem;">{m.capitalize()}</span>'
            row = f"""
            <tr>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;font-weight:600;">{_esc(kw)}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge(tit)}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge(des)}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge(h1)}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge(h2)}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge(slg)}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">{_esc(score)}</td>
            </tr>
            """
            body_rows.append(row)
        bar = _progress("Overall META", overall if isinstance(overall, int) else 0)
        return bar + _table(thead + "<tbody>" + "".join(body_rows) + "</tbody>", min_width=840)

    # Fallback: legacy
    items = legacy_items
    total = legacy_total
    if not items:
        return '<p style="color:#6b7280;">No se proporcionaron keywords o no se detectó relevancia.</p>'

    thead = """
    <thead>
      <tr>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Keyword</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">&lt;title&gt;</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">meta description</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">H1</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">H2</th>
        <th style="text-align:right;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Score</th>
      </tr>
    </thead>
    """
    body_rows = []
    for it in items:
        td_kw  = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;font-weight:600;">{_esc(it.get("kw",""))}</td>'
        td_tit = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_title", False))}</td>'
        td_des = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_description", False))}</td>'
        td_h1  = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_h1", False))}</td>'
        td_h2  = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_h2", False))}</td>'
        td_sc  = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;text-align:right;font-weight:600;">{_esc(it.get("kw_score",0))}</td>'
        body_rows.append(f"<tr>{td_kw}{td_tit}{td_des}{td_h1}{td_h2}{td_sc}</tr>")
    tfoot = f"""
    <tfoot>
      <tr>
        <td colspan="5" style="padding:.5rem .75rem;border-top:2px solid #e5e7eb;text-align:right;font-weight:700;background:#fafafa;">Score total</td>
        <td style="padding:.5rem .75rem;border-top:2px solid #e5e7eb;text-align:right;font-weight:700;background:#fafafa;">{_esc(total)}</td>
      </tr>
    </tfoot>
    """
    return _table(thead + "<tbody>" + "".join(body_rows) + "</tbody>" + tfoot, min_width=720)

def _kw_table_social(soc_kw_block: Dict) -> str:
    """Tabla por keyword (Social). Soporta enriquecido y legacy."""
    if not soc_kw_block:
        return '<p style="color:#6b7280;">No se proporcionaron keywords o no se detectó relevancia.</p>'

    by_kw = soc_kw_block.get("by_keyword") or {}
    overall = soc_kw_block.get("overall_score")
    legacy_items = soc_kw_block.get("keywords") or []
    legacy_total = soc_kw_block.get("score", 0)

    # Enriquecido
    if by_kw:
        thead = """
        <thead>
          <tr>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Keyword</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">og:title</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">og:description</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">twitter:title</th>
            <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">twitter:description</th>
            <th style="text-align:right;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Score</th>
          </tr>
        </thead>
        """
        def badge(m):
            m = (m or "none").lower()
            color = {"exact":"#16a34a","partial":"#f59e0b","none":"#ef4444"}.get(m,"#6b7280")
            bg = {"exact":"#ecfdf5","partial":"#fffbeb","none":"#fef2f2"}.get(m,"#f3f4f6")
            return f'<span style="display:inline-block;padding:.15rem .5rem;border-radius:999px;border:1px solid #e5e7eb;background:{bg};color:{color};font-weight:600;font-size:.75rem;">{m.capitalize()}</span>'

        body_rows: List[str] = []
        for kw, d in by_kw.items():
            og = d.get("og", {}) or {}
            tw = d.get("twitter", {}) or {}
            row = f"""
            <tr>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;font-weight:600;">{_esc(kw)}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge((og.get('title') or {}).get('match'))}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge((og.get('description') or {}).get('match'))}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge((tw.get('title') or {}).get('match'))}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;">{badge((tw.get('description') or {}).get('match'))}</td>
              <td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">{_esc(d.get('score',0))}</td>
            </tr>
            """
            body_rows.append(row)
        bar = _progress("Overall SOCIAL", overall if isinstance(overall, int) else 0)
        return bar + _table(thead + "<tbody>" + "".join(body_rows) + "</tbody>", min_width=840)

    # Fallback: legacy
    items = legacy_items
    total = legacy_total
    if not items:
        return '<p style="color:#6b7280;">No se proporcionaron keywords o no se detectó relevancia.</p>'

    thead = """
    <thead>
      <tr>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Keyword</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">og:title</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">og:description</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">twitter:title</th>
        <th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">twitter:description</th>
        <th style="text-align:right;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">Score</th>
      </tr>
    </thead>
    """
    body_rows = []
    for it in items:
        td_kw  = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;font-weight:600;">{_esc(it.get("kw",""))}</td>'
        td_ogt = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_og_title", False))}</td>'
        td_ogd = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_og_description", False))}</td>'
        td_twt = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_tw_title", False))}</td>'
        td_twd = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_yn(it.get("in_tw_description", False))}</td>'
        td_sc  = f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;text-align:right;font-weight:600;">{_esc(it.get("kw_score",0))}</td>'
        body_rows.append(f"<tr>{td_kw}{td_ogt}{td_ogd}{td_twt}{td_twd}{td_sc}</tr>")
    tfoot = f"""
    <tfoot>
      <tr>
        <td colspan="5" style="padding:.5rem .75rem;border-top:2px solid #e5e7eb;text-align:right;font-weight:700;background:#fafafa;">Score total</td>
        <td style="padding:.5rem .75rem;border-top:2px solid #e5e7eb;text-align:right;font-weight:700;background:#fafafa;">{_esc(total)}</td>
      </tr>
    </tfoot>
    """
    return _table(thead + "<tbody>" + "".join(body_rows) + "</tbody>" + tfoot, min_width=820)

def _render_plan(plan_df: pd.DataFrame) -> str:
    if plan_df is None or plan_df.empty:
        return '<p style="color:#6b7280;">No hay tareas en el plan de acciones.</p>'
    cols_order = ["Prioridad","Categoría","Tarea","Responsable","Impacto","Esfuerzo","Estado","Fecha objetivo","Notas"]
    cols = [c for c in cols_order if c in plan_df.columns] or list(plan_df.columns)
    thead = "<thead><tr>" + "".join([f'<th style="text-align:left;padding:.5rem .75rem;border-bottom:2px solid #e5e7eb;background:#f9fafb;">{_esc(c)}</th>' for c in cols]) + "</tr></thead>"
    body_rows = []
    for _, row in plan_df[cols].iterrows():
        tds = "".join([f'<td style="padding:.5rem .75rem;border-bottom:1px solid #e5e7eb;vertical-align:top;">{_esc(row.get(c, ""))}</td>' for c in cols])
        body_rows.append(f"<tr>{tds}</tr>")
    tbody = "<tbody>" + "".join(body_rows) + "</tbody>"
    return _table(thead + tbody, min_width=680)

def build_html_report(
    url: str,
    audited_at: str,
    meta: Dict,
    social: Dict,
    perf: Dict,
    crawl: Dict,
    headings: Dict,
    plan_df: pd.DataFrame,
    logo_data_uri: Optional[str] = None,
    slogan_text: str = "ONLINE REPUTATIONAL ENGINEERING INTELLIGENCE",
    ia_summary_html: Optional[str] = None,  # ← bloque IA (HTML)
) -> str:
    """Devuelve HTML completo del reporte."""
    # --------- portada ----------
    logo_html = f'<img src="{logo_data_uri}" style="width:54px;height:54px;border-radius:10px;border:1px solid #e5e7eb;background:#0f172a;object-fit:cover;" />' if logo_data_uri else ""
    cover = f"""
    <header style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 18px;">
      <div style="display:flex;align-items:center;gap:12px;">
        {logo_html}
        <div>
          <h1 style="margin:.2rem 0;font-size:1.6rem;">Opun SEO Lite — Reporte</h1>
          <div style="color:#6b7280;">URL: <b>{_esc(url)}</b></div>
          <div style="color:#6b7280;">Fecha: {_esc(audited_at)}</div>
        </div>
      </div>
      <div style="font-weight:700;border:1px solid #e5e7eb;border-radius:12px;padding:.5rem .75rem;background:#fff;">Auditoría On-Page & Técnica</div>
    </header>
    """

    # --------- leyenda ----------
    legend = _legend()

    # --------- Resumen ejecutivo IA (mejorado) ----------
    sec_ia = _render_exec_summary_ia(ia_summary_html) if ia_summary_html else ""

    # --------- Metadatos (semáforo) ----------
    m_rows = "".join([
        _krow("Título", meta.get("title",{}).get("value","—"), meta.get("title",{}).get("status")),
        _krow("Meta description", meta.get("description",{}).get("value","—"), meta.get("description",{}).get("status")),
        _krow("Canonical", meta.get("canonical",{}).get("value") or "—", meta.get("canonical",{}).get("status")),
        _krow("Robots (meta)", meta.get("robots_meta",{}).get("value") or "—", meta.get("robots_meta",{}).get("status")),
        _krow("HTTP Status", str(meta.get("http_status","—"))),
        _krow("Content-Type", meta.get("content_type") or "—"),
    ])
    sec_meta = _section("Metadatos (semáforo)", _table(m_rows))

    # --------- Relevancia por keywords (Metadatos) ----------
    meta_kw_block = meta.get("keyword_relevance") or {}
    sec_meta_kw = _section("Relevancia por keywords (Metadatos)", _kw_table_meta(meta_kw_block))

    # --------- Social ----------
    og = social.get("og", {}) or {}
    tw = social.get("twitter", {}) or {}
    og_rows = "".join([
        _krow("og:title", og.get("og:title") or "—", og.get("status")),
        _krow("og:description", og.get("og:description") or "—"),
        _krow("og:image", og.get("og:image") or "—"),
        _krow("og:type", og.get("og:type") or "—"),
        _krow("og:url", og.get("og:url") or "—"),
        _krow("og:site_name", og.get("og:site_name") or "—"),
    ])
    tw_rows = "".join([
        _krow("twitter:card", tw.get("twitter:card") or "—", tw.get("status")),
        _krow("twitter:title", tw.get("twitter:title") or "—"),
        _krow("twitter:description", tw.get("twitter:description") or "—"),
        _krow("twitter:image", tw.get("twitter:image") or "—"),
    ])
    social_html = f"""
    <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:12px;">
      <div style="grid-column:span 6;">{_table(og_rows)}</div>
      <div style="grid-column:span 6;">{_table(tw_rows)}</div>
    </div>
    """
    if social.get("preview_image"):
        social_html += f"""
        <div style="margin-top:10px;">
          <div style="font-weight:600;margin-bottom:6px;">Vista previa de imagen social</div>
          <img src="{_esc(social['preview_image'])}" style="max-width:100%;border:1px solid #e5e7eb;border-radius:12px;">
        </div>
        """
    sec_social = _section("Checklist Social (OG/Twitter)", social_html)

    # --------- Relevancia por keywords (Social) ----------
    social_kw_block = social.get("keyword_relevance") or {}
    sec_social_kw = _section("Relevancia por keywords (Social)", _kw_table_social(social_kw_block))

    # --------- Rendimiento (mini WPO) ----------
    perf_rows = "".join([
        _krow("TTFB (ms)", str(perf.get("ttfb_ms","—")), perf.get("ttfb_status")),
        _krow("Peso HTML", perf.get("html_size_readable","—")),
        _krow("# Imágenes en HTML", str(perf.get("num_images","—"))),
        _krow("# Enlaces en HTML", str(perf.get("num_links","—"))),
        _krow("Compresión (gzip/br)", "Sí" if perf.get("compression",{}).get("value") else "No", perf.get("compression",{}).get("status")),
        _krow("Cache-Control", perf.get("cache_control",{}).get("value") or "—", perf.get("cache_control",{}).get("status")),
        _krow("Content-Type", perf.get("content_type") or "—"),
    ])
    sec_perf = _section("Rendimiento rápido (mini WPO)", _table(perf_rows))

    # --------- Rastreo e indexabilidad ----------
    red_rows = ""
    chain = crawl.get("redirect_chain", []) or []
    if chain:
        for (status, u) in chain:
            red_rows += _krow(u, str(status))
    else:
        red_rows += _krow("Sin redirecciones", "—", "green")
    red_rows += _krow("Estado final", str(crawl.get("final_status","—")), "green" if crawl.get("final_status") == 200 else "red")
    red_html = _table(red_rows)

    hdr_rows = ""
    for h in crawl.get("headers", []):
        hdr_rows += _krow(h.get("key","—"), h.get("value") or "—")
    xrt = crawl.get("x_robots_tag") or ""
    hdr_rows += _krow("x-robots-tag", xrt or "—", "red" if ("noindex" in xrt) else None)
    hdr_html = _table(hdr_rows)

    rb = crawl.get("robots_info", {}) or {}
    sm = crawl.get("sitemap_info", {}) or {}
    rb_rows = "".join([
        _krow("Declarado", rb.get("declared") or "—"),
        _krow("Accesible", "Sí" if rb.get("ok") else "No"),
        _krow("URL final", rb.get("final_url") or "—"),
        _krow("Status", str(rb.get("status") or "—")),
    ])
    sm_rows = "".join([
        _krow("Declarado", sm.get("declared") or "—"),
        _krow("Accesible", "Sí" if sm.get("ok") else "No"),
        _krow("URL final", sm.get("final_url") or "—"),
        _krow("Status", str(sm.get("status") or "—")),
    ])
    crawl_html = f"""
    <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:12px;">
      <div style="grid-column:span 6;">
        <div style="font-weight:700;margin-bottom:.35rem;">Cadena de redirecciones {_chip(crawl.get('chain_status'))}</div>
        {red_html}
      </div>
      <div style="grid-column:span 6;">
        <div style="font-weight:700;margin-bottom:.35rem;">Cabeceras clave</div>
        {hdr_html}
      </div>
      <div style="grid-column:span 6;">
        <div style="font-weight:700;margin-bottom:.35rem;">robots.txt</div>
        {_table(rb_rows)}
      </div>
      <div style="grid-column:span 6;">
        <div style="font-weight:700;margin-bottom:.35rem;">sitemap.xml</div>
        {_table(sm_rows)}
      </div>
    </div>
    """
    sec_crawl = _section("Rastreo e indexabilidad (cabeceras/redirects)", crawl_html)

    # --------- Metadatos y encabezados (detalle) ----------
    det_rows = "".join([
        _krow("Título", headings.get("title","—")),
        _krow("Meta description", headings.get("meta_description","—")),
        _krow("Robots (meta)", headings.get("robots_meta","—")),
        _krow("Canonical", headings.get("canonical","—")),
    ])
    def _list_block(items, label):
        if not items:
            return f"<div><b>{_esc(label)}:</b> —</div>"
        lis = "".join([f"<li>{_esc(i)}</li>" for i in items])
        return f"<div><b>{_esc(label)}:</b><ul style='margin:.35rem 0 .75rem 1.2rem'>{lis}</ul></div>"

    headings_html = _table(det_rows) + \
        _list_block(headings.get("h1", []), "H1") + \
        _list_block(headings.get("h2", []), "H2 (top)") + \
        _list_block(headings.get("h3", []), "H3 (top)")
    sec_detail = _section("Metadatos y encabezados (detalle)", headings_html)

    # --------- Plan de acciones ----------
    plan_html = _render_plan(plan_df)
    sec_plan = _section("Plan de acciones", plan_html)

    # --------- ensamblado ----------
    gold_color = "#d4af37"
    html_doc = f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Reporte Opun SEO Lite</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html,body{{background:#f3f4f6;margin:0;padding:0;color:#111827;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial;}}
    .container{{max-width:1040px;margin:0 auto;padding:18px;}}
    .brand-slogan{{color:{gold_color};letter-spacing:.06em;font-weight:700;font-size:.8rem;text-transform:uppercase;}}
    @media print {{
      header, .noprint {{ display:none !important; }}
      body {{ background:#fff; }}
      section {{ break-inside: avoid-page; page-break-inside: avoid; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    {cover}
    {legend}
    {sec_ia}
    {sec_meta}
    {sec_meta_kw}
    {sec_social}
    {sec_social_kw}
    {sec_perf}
    {sec_crawl}
    {sec_detail}
    {sec_plan}
    <footer style="margin-top:1.2rem;">
      <div class="brand-slogan">{_esc(slogan_text)}</div>
      <div style="color:#6b7280;font-size:.85rem;margin-top:.25rem;">
        Generado con Opun SEO Lite. Este reporte es orientativo y prioriza acciones de alto impacto.
      </div>
    </footer>
  </div>
</body>
</html>
"""
    return html_doc
