import type { AuditFullResult } from "@/lib/gateways/audits";

export const auditResultSample: AuditFullResult = {
  executive_summary: {
    html: `<p><strong>Resumen:</strong> La pagina evaluada presenta buen estado general (82/100).
    Se identificaron oportunidades en metaetiquetas y rendimiento. Recomendamos priorizar
    mejoras de <em>Core Web Vitals</em> y consistencia de snippet.</p>`,
  },
  scores: { onpage: 85, indexability: 90, wpo: 72, social: 78, overall: 82 },
  seo_meta: {
    title: { value: "Producto X — Plataforma SEO y ORM", status: "green" },
    description: { value: "Suite para visibilidad y reputacion de marca.", status: "amber" },
    robots_meta: { value: "index,follow", status: "green" },
    canonical: { value: "https://www.tu-cliente.com/", status: "green" },
    headings_top: {
      h1: ["Producto X — Inteligencia SEO"],
      h2: ["Automatiza auditorias", "Monitoreo reputacional"],
    },
    keyword_relevance: {
      by_keyword: {
        "plataforma seo": { title: { match: "high" }, score: 86 },
        "reputacion online": { h1: { match: "medium" }, score: 72 },
      },
    },
    suggestions: [
      { prioridad: "Alta", tarea: "Ajustar meta description a 150–160 chars", categoria: "On-page", impacto: "Alto", esfuerzo: "Bajo" },
    ],
  },
  crawl_indexability: {
    final_status: 200,
    redirect_chain: [],
    chain_status: "green",
    x_robots_tag: "",
    suggestions: [
      { prioridad: "Media", tarea: "Verificar sitemap.xml actualizado", categoria: "Indexabilidad", impacto: "Medio", esfuerzo: "Bajo" },
    ],
  },
  performance: {
    core_web_vitals: { lcp_ms: 2900, cls: 0.06, inp_ms: 160 },
    assets: { total_js_bytes: 820000, total_css_bytes: 180000 },
    suggestions: [
      { prioridad: "Alta", tarea: "Dividir bundle JS y lazy-load", categoria: "Rendimiento", impacto: "Alto", esfuerzo: "Medio" },
    ],
  },
  social: {
    og: { title: "Producto X", description: "Visibilidad y ORM", image: "https://example.com/og.png" },
    twitter: { card: "summary_large_image" },
    suggestions: [
      { prioridad: "Media", tarea: "Unificar OG:title con Title principal", categoria: "Social", impacto: "Medio", esfuerzo: "Bajo" },
    ],
  },
  serp: [
    { keyword: "plataforma seo", status: "found", position: 8, found_url: "https://www.tu-cliente.com/" },
    { keyword: "reputacion online marca", status: "found", position: 12, found_url: "https://www.tu-cliente.com/blog" },
  ],
};

