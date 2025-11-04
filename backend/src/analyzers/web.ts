import { load } from "cheerio";

export type KeywordRelevance = {
  by_keyword: Record<string, any>;
  overall_score: number;
  // legacy compatibility
  keywords: Array<any>;
  score: number;
};

export type SeoMetaResult = {
  status: "ok" | "error";
  error?: string | null;
  url: string;
  title: { value: string; len: number; status: "green" | "amber" | "red" };
  description: { value: string; len: number; status: "green" | "amber" | "red" };
  robots_meta: { value: string; status: "green" | "red" };
  canonical: { value: string; absolute: boolean; status: "green" | "red" };
  headings_top: { h1: string[]; h2: string[]; h3: string[] };
  keyword_relevance: KeywordRelevance;
  suggestions: Array<Record<string, any>>;
};

export type CrawlIndexabilityResult = {
  status: "ok" | "error";
  error?: string | null;
  url: string;
  redirect_chain: Array<{ status: number; url: string }>;
  final_status: number | null;
  chain_status: "green" | "amber" | "red";
  headers: Array<{ key: string; value: string }>;
  x_robots_tag: string;
  robots_info: { declared: string; ok: boolean; final_url: string; status: number | null };
  sitemap_info: { declared: string; ok: boolean; final_url: string; status: number | null };
  suggestions: Array<Record<string, any>>;
};

export type PerformanceResult = {
  status: "ok" | "error";
  error?: string | null;
  url: string;
  ttfb_ms: number | null;
  ttfb_status: "green" | "amber" | "red";
  html_size_bytes: number;
  num_images: number;
  num_links: number;
  compression: { value: boolean; status: "green" | "amber" | "red" };
  cache_control: { value: string; status: "green" | "amber" | "red" };
  content_type: string;
  suggestions: Array<Record<string, any>>;
};

export type SocialResult = {
  status: "ok" | "error";
  error?: string | null;
  url: string;
  og: Record<string, any> & { status: "green" | "amber" | "red" };
  twitter: Record<string, any> & { status: "green" | "amber" | "red" };
  preview_image: string;
  keyword_relevance: KeywordRelevance;
  suggestions: Array<Record<string, any>>;
};

export type SerpRow = {
  keyword: string;
  status: "found_exact" | "found_same_domain" | "not_found_topN";
  position: number | null;
  found_url: string;
  title: string;
  lang: string;
  country: string;
  depth: number;
  timestamp: string;
  target_url: string;
};

export type AuditFullResult = {
  seo_meta?: SeoMetaResult;
  crawl_indexability?: CrawlIndexabilityResult;
  performance?: PerformanceResult;
  social?: SocialResult;
  serp?: SerpRow[];
  scores?: {
    onpage?: number;
    indexability?: number;
    wpo?: number;
    social?: number;
    serp?: number;
    overall?: number;
  };
  executive_summary?: { html?: string; markdown?: string };
};

// ================= Helpers =================
function textLenStatus(n: number, goodRange: [number, number], warnRange: [number, number]):
  | "green"
  | "amber"
  | "red" {
  const [gmin, gmax] = goodRange;
  const [wmin, wmax] = warnRange;
  if (n >= gmin && n <= gmax) return "green";
  if (n >= wmin && n <= wmax) return "amber";
  return "red";
}

function boolStatus(ok: boolean, warn = false): "green" | "amber" | "red" {
  if (ok) return "green";
  return warn ? "amber" : "red";
}

function isAbsUrl(u: string) {
  return /^https?:\/\//i.test(u || "");
}

function boundaryMatchType(text: string, kw: string): "exact" | "partial" | "none" {
  if (!text || !kw) return "none";
  const t = text.toLowerCase();
  const k = kw.toLowerCase().trim();
  const pat = new RegExp(`(?<![0-9a-záéíóúñü])${escapeRegExp(k)}(?![0-9a-záéíóúñü])`, "i");
  if (pat.test(t)) return "exact";
  return t.includes(k) ? "partial" : "none";
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(text: string): string[] {
  return (text || "").toLowerCase().match(/[0-9a-záéíóúñü]+/g) || [];
}

function densitySimple(corpus: string, kw: string): number {
  const toks = tokenize(corpus);
  if (!toks.length) return 0;
  const joined = ` ${toks.join(" ")} `;
  const occ = (joined.match(new RegExp(` ${escapeRegExp(kw.toLowerCase())} `, "g")) || []).length;
  return occ / Math.max(1, toks.length);
}

function densityStatus(d: number): "green" | "amber" | "red" {
  if (d <= 0.015) return "green";
  if (d <= 0.025) return "amber";
  return "red";
}

function scoreFromMatches(mt: string, weight: number) {
  const factor = mt === "exact" ? 1 : mt === "partial" ? 0.6 : 0;
  return factor * weight;
}

function urlRoot(u: string) {
  try {
    const p = new URL(u);
    return `${p.protocol}//${p.host}`;
  } catch {
    return u;
  }
}

// ================= Analyzers =================
export async function analyzeSeoMeta(url: string, keywords?: string[]): Promise<SeoMetaResult> {
  try {
    const start = performance.now();
    const resp = await fetch(url, { redirect: "follow" });
    const _elapsed = performance.now() - start;
    const html = await resp.text();
    const $ = load(html);
    const title = ($("title").text() || "").trim();
    const desc = ($('meta[name="description"]').attr("content") || "").trim();
    const robots = ($('meta[name="robots"]').attr("content") || "").trim().toLowerCase();
    let canonical = "";
    $("link[rel]").each((_, el) => {
      const relRaw = ($(el).attr("rel") || "").toLowerCase();
      if (relRaw.split(/\s+/).includes("canonical") && !canonical) {
        canonical = ($(el).attr("href") || "").trim();
      }
    });
    const h1s = $("h1").map((_, el) => $(el).text().trim()).get();
    const h2s = $("h2").map((_, el) => $(el).text().trim()).get().slice(0, 10);
    const h3s = $("h3").map((_, el) => $(el).text().trim()).get().slice(0, 10);

    const titleStatus = textLenStatus((title || "").length, [30, 60], [20, 70]);
    const descStatus = textLenStatus((desc || "").length, [70, 160], [50, 180]);
    const robotsFlags = new Set((robots || "").split(",").map((s) => s.trim()));
    const robotsOk = !robotsFlags.size || ((robotsFlags.has("index") || robotsFlags.has("all")) && !robotsFlags.has("nofollow"));
    const robotsStatus = robotsOk ? "green" : "red" as const;
    const canonAbs = isAbsUrl(canonical);

    const corpus = [title, desc, ...h1s, ...h2s].join(" ").trim();

    const kwRel: KeywordRelevance = { keywords: [], score: 0, by_keyword: {}, overall_score: 0 };
    const perKwScores: number[] = [];
    if (keywords && keywords.length) {
      for (const kw of keywords) {
        const mtTitle = boundaryMatchType(title, kw);
        const mtDesc = boundaryMatchType(desc, kw);
        const mtH1s = h1s.map((t) => boundaryMatchType(t, kw));
        const mtH2s = h2s.map((t) => boundaryMatchType(t, kw));
        const mtH1Best = mtH1s.sort((a, b) => ({ exact: 0, partial: 1, none: 2 }[a] - ({ exact: 0, partial: 1, none: 2 }[b])))[0] || "none";
        const mtH2Best = mtH2s.sort((a, b) => ({ exact: 0, partial: 1, none: 2 }[a] - ({ exact: 0, partial: 1, none: 2 }[b])))[0] || "none";
        const slug = (() => {
          try { const u = new URL(url); return (u.pathname || "/").split("/").filter(Boolean).pop() || u.pathname; } catch { return ""; }
        })();
        const mtSlug = boundaryMatchType((slug || "").replace(/-/g, " "), kw);
        const dens = densitySimple(corpus, kw);
        const densStatus = densityStatus(dens);
        const score = Math.round(
          scoreFromMatches(mtTitle, 40) +
          scoreFromMatches(mtDesc, 25) +
          scoreFromMatches(mtH1Best, 20) +
          scoreFromMatches(mtSlug, 10) +
          scoreFromMatches(mtH2Best, 5)
        );
        perKwScores.push(score);
        kwRel.by_keyword[kw] = {
          title: { present: mtTitle !== "none", match: mtTitle },
          meta_description: { present: mtDesc !== "none", match: mtDesc },
          h1: { present: mtH1Best !== "none", match: mtH1Best, count: mtH1s.filter((m) => m !== "none").length },
          h2: { present: mtH2Best !== "none", match: mtH2Best, count: mtH2s.filter((m) => m !== "none").length },
          url_slug: { present: mtSlug !== "none", match: mtSlug },
          density: { value: Number(dens.toFixed(4)), status: densStatus },
          score,
          suggestions: [],
        };
        // legacy compact
        kwRel.keywords.push({
          kw,
          in_title: mtTitle !== "none",
          in_description: mtDesc !== "none",
          in_h1: mtH1Best !== "none",
          in_h2: mtH2Best !== "none",
          kw_score: (mtTitle !== "none" ? 3 : 0) + (mtDesc !== "none" ? 2 : 0) + (mtH1Best !== "none" ? 2 : 0) + (mtH2Best !== "none" ? 1 : 0),
        });
        kwRel.score += kwRel.keywords[kwRel.keywords.length - 1].kw_score;
      }
      kwRel.overall_score = Math.round(perKwScores.reduce((a, b) => a + b, 0) / Math.max(1, perKwScores.length));
    }

    const suggestions: Array<Record<string, any>> = [];
    if (titleStatus !== "green") suggestions.push({ prioridad: "Alta", categoria: "On-Page", tarea: "Optimizar <title> a 30–60 caracteres con marca/keyword.", impacto: "Alto", esfuerzo: "Bajo", nota: `Longitud actual: ${(title || "").length}` });
    if (descStatus !== "green") suggestions.push({ prioridad: "Media", categoria: "On-Page", tarea: "Ajustar meta description a 70–160 caracteres.", impacto: "Medio", esfuerzo: "Bajo", nota: `Longitud actual: ${(desc || "").length}` });
    if (!canonAbs) suggestions.push({ prioridad: "Media", categoria: "On-Page", tarea: "Definir <link rel=\"canonical\"> absoluto.", impacto: "Medio", esfuerzo: "Bajo", nota: canonical ? "No absoluto" : "Falta canonical" });
    if (!robotsOk) suggestions.push({ prioridad: "Alta", categoria: "Indexabilidad", tarea: "Revisar meta robots (evita noindex/nofollow).", impacto: "Alto", esfuerzo: "Bajo", nota: robots });

    return {
      status: "ok",
      error: null,
      url,
      title: { value: title, len: (title || "").length, status: titleStatus },
      description: { value: desc, len: (desc || "").length, status: descStatus },
      robots_meta: { value: robots, status: robotsStatus },
      canonical: { value: canonical, absolute: canonAbs, status: boolStatus(canonAbs) },
      headings_top: { h1: h1s, h2: h2s, h3: h3s },
      keyword_relevance: kwRel,
      suggestions,
    };
  } catch (err) {
    return {
      status: "error",
      error: String(err),
      url,
      title: { value: "", len: 0, status: "red" },
      description: { value: "", len: 0, status: "red" },
      robots_meta: { value: "", status: "red" },
      canonical: { value: "", absolute: false, status: "red" },
      headings_top: { h1: [], h2: [], h3: [] },
      keyword_relevance: { keywords: [], score: 0, by_keyword: {}, overall_score: 0 },
      suggestions: [
        { prioridad: "Alta", categoria: "Conectividad", tarea: "Resolver conectividad/TLS para auditar metadatos.", impacto: "Alto", esfuerzo: "Medio" },
      ],
    };
  }
}

export async function analyzeCrawl(url: string): Promise<CrawlIndexabilityResult> {
  const headerKeys = ["content-type", "content-encoding", "cache-control", "vary", "x-robots-tag", "server"];
  try {
    // Build redirect chain manually (max 5 hops)
    const chain: Array<{ status: number; url: string }> = [];
    let current = url;
    let finalStatus: number | null = null;
    for (let i = 0; i < 5; i++) {
      const res = await fetch(current, { redirect: "manual" });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location") || "";
        chain.push({ status: res.status, url: current });
        if (!loc) { finalStatus = res.status; break; }
        current = new URL(loc, current).toString();
        continue;
      } else {
        // final
        finalStatus = res.status;
        break;
      }
    }
    if (finalStatus == null) finalStatus = 0;
    const resFinal = await fetch(current, { redirect: "follow" });
    const headersList = headerKeys.map((k) => ({ key: k, value: resFinal.headers.get(k) || "" }));
    const xrobots = resFinal.headers.get("x-robots-tag")?.toLowerCase() || "";
    const root = urlRoot(current);
    const robotsUrl = `${root}/robots.txt`;
    const sitemapUrl = `${root}/sitemap.xml`;
    const rRob = await fetch(robotsUrl, { redirect: "follow" }).catch(() => null);
    const rSmap = await fetch(sitemapUrl, { redirect: "follow" }).catch(() => null);
    const robotsInfo = { declared: robotsUrl, ok: Boolean(rRob && rRob.ok), final_url: rRob?.url || robotsUrl, status: rRob?.status ?? null };
    const sitemapInfo = { declared: sitemapUrl, ok: Boolean(rSmap && rSmap.ok), final_url: rSmap?.url || sitemapUrl, status: rSmap?.status ?? null };

    const chainStatus = (() => {
      if (finalStatus === 200 && chain.length === 0) return "green" as const;
      if (finalStatus === 200 && chain.length === 1 && [301, 302, 307, 308].includes(chain[0].status)) return "amber" as const;
      return "red" as const;
    })();

    const suggestions: Array<Record<string, any>> = [];
    if (chainStatus === "red") suggestions.push({ prioridad: "Alta", categoria: "Indexabilidad", tarea: "Reducir cantidad de redirecciones (ideal 0, máx 1).", impacto: "Alto", esfuerzo: "Medio", nota: `Hops: ${chain.length}, estado final: ${finalStatus}` });
    if (finalStatus !== 200) suggestions.push({ prioridad: "Alta", categoria: "Indexabilidad", tarea: "Asegurar respuesta 200 en URL final/canónica.", impacto: "Alto", esfuerzo: "Medio", nota: `Estado final: ${finalStatus}` });
    if (xrobots.includes("noindex")) suggestions.push({ prioridad: "Alta", categoria: "Indexabilidad", tarea: "Quitar 'noindex' de X-Robots-Tag en producción.", impacto: "Alto", esfuerzo: "Bajo", nota: xrobots });
    if (!robotsInfo.ok) suggestions.push({ prioridad: "Baja", categoria: "Indexabilidad", tarea: "Publicar robots.txt accesible.", impacto: "Bajo", esfuerzo: "Bajo", nota: robotsInfo.declared });
    if (!sitemapInfo.ok) suggestions.push({ prioridad: "Media", categoria: "Indexabilidad", tarea: "Declarar sitemap.xml y referenciar en robots.txt.", impacto: "Medio", esfuerzo: "Bajo", nota: sitemapInfo.declared });

    return {
      status: "ok",
      error: null,
      url,
      redirect_chain: chain,
      final_status: finalStatus,
      chain_status: chainStatus,
      headers: headersList,
      x_robots_tag: xrobots,
      robots_info: robotsInfo,
      sitemap_info: sitemapInfo,
      suggestions,
    };
  } catch (err) {
    return {
      status: "error",
      error: String(err),
      url,
      redirect_chain: [],
      final_status: null,
      chain_status: "red",
      headers: [],
      x_robots_tag: "",
      robots_info: { declared: "", ok: false, final_url: "", status: null },
      sitemap_info: { declared: "", ok: false, final_url: "", status: null },
      suggestions: [
        { prioridad: "Media", categoria: "Indexabilidad", tarea: "Resolver conectividad/TLS para evaluar redirects/cabeceras.", impacto: "Medio", esfuerzo: "Bajo" },
      ],
    };
  }
}

export async function analyzePerformance(url: string): Promise<PerformanceResult> {
  try {
    const start = performance.now();
    const resp = await fetch(url, { redirect: "follow" });
    const ttfb = Math.round(performance.now() - start);
    const buf = await resp.arrayBuffer();
    const html = Buffer.from(buf).toString();
    const $ = load(html);
    const images = $("img[src]").length;
    const links = $("a[href]").length;
    const cenc = (resp.headers.get("content-encoding") || "").toLowerCase();
    const caching = (resp.headers.get("cache-control") || "").toLowerCase();
    const ctype = resp.headers.get("content-type") || "";
    const ttfbStatus = ttfb <= 300 ? "green" : ttfb <= 600 ? "amber" : "red" as const;
    const hasCompression = ["br", "gzip", "deflate"].some((k) => cenc.includes(k));
    const hasCache = ["max-age", "s-maxage", "public"].some((k) => caching.includes(k));
    const suggestions: Array<Record<string, any>> = [];
    if (ttfbStatus !== "green") suggestions.push({ prioridad: "Alta", categoria: "WPO", tarea: "Reducir TTFB < 300 ms (CDN/cache, backend).", impacto: "Alto", esfuerzo: "Medio", nota: `TTFB actual: ${ttfb} ms` });
    if (!hasCompression) suggestions.push({ prioridad: "Media", categoria: "WPO", tarea: "Habilitar compresión (brotli/gzip).", impacto: "Medio", esfuerzo: "Bajo" });
    if (!hasCache) suggestions.push({ prioridad: "Media", categoria: "WPO", tarea: "Definir Cache-Control para estáticos.", impacto: "Medio", esfuerzo: "Bajo", nota: `Cache-Control: ${caching || 'no definido'}` });
    if (images > 15) suggestions.push({ prioridad: "Baja", categoria: "WPO", tarea: "Optimizar número/peso de imágenes (lazy-load, formatos modernos).", impacto: "Medio", esfuerzo: "Medio", nota: `Imágenes en HTML: ${images}` });

    return {
      status: "ok",
      error: null,
      url,
      ttfb_ms: ttfb,
      ttfb_status: ttfbStatus,
      html_size_bytes: Buffer.byteLength(html),
      num_images: images,
      num_links: links,
      compression: { value: hasCompression, status: boolStatus(hasCompression) },
      cache_control: { value: caching, status: boolStatus(hasCache, true) },
      content_type: ctype,
      suggestions,
    };
  } catch (err) {
    return {
      status: "error",
      error: String(err),
      url,
      ttfb_ms: null,
      ttfb_status: "red",
      html_size_bytes: 0,
      num_images: 0,
      num_links: 0,
      compression: { value: false, status: "red" },
      cache_control: { value: "", status: "amber" },
      content_type: "",
      suggestions: [
        { prioridad: "Alta", categoria: "WPO", tarea: "Restablecer conectividad/TLS para medir rendimiento.", impacto: "Alto", esfuerzo: "Medio" },
      ],
    };
  }
}

export async function analyzeSocial(url: string, keywords?: string[]): Promise<SocialResult> {
  try {
    const resp = await fetch(url, { redirect: "follow" });
    const html = await resp.text();
    const $ = load(html);
    const og: Record<string, string> = {};
    const tw: Record<string, string> = {};
    const getMeta = (attr: "property" | "name", name: string) => $(`meta[${attr}='${name}']`).attr("content") || "";
    for (const k of ["og:title", "og:description", "og:image", "og:type", "og:url", "og:site_name"]) og[k] = getMeta("property", k);
    for (const k of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) tw[k] = getMeta("name", k);
    const ogOk = Boolean(og["og:title"]) && Boolean(og["og:description"]) && Boolean(og["og:image"]);
    const twOk = Boolean(tw["twitter:title"]) && Boolean(tw["twitter:description"]) && Boolean(tw["twitter:image"]);
    const ogStatus = boolStatus(ogOk, Boolean(og["og:title"]) || Boolean(og["og:description"])) as "green" | "amber" | "red";
    const twStatus = boolStatus(twOk, Boolean(tw["twitter:title"]) || Boolean(tw["twitter:description"])) as "green" | "amber" | "red";
    const preview = og["og:image"] || tw["twitter:image"] || "";

    const kwRel: KeywordRelevance = { keywords: [], score: 0, by_keyword: {}, overall_score: 0 };
    const perScores: number[] = [];
    if (keywords && keywords.length) {
      for (const kw of keywords) {
        const mt_ogt = boundaryMatchType(og["og:title"] || "", kw);
        const mt_ogd = boundaryMatchType(og["og:description"] || "", kw);
        const mt_twt = boundaryMatchType(tw["twitter:title"] || "", kw);
        const mt_twd = boundaryMatchType(tw["twitter:description"] || "", kw);
        const score = Math.round(
          scoreFromMatches(mt_ogt, 35) +
          scoreFromMatches(mt_ogd, 25) +
          scoreFromMatches(mt_twt, 25) +
          scoreFromMatches(mt_twd, 15)
        );
        perScores.push(score);
        kwRel.by_keyword[kw] = {
          og: { title: { present: mt_ogt !== "none", match: mt_ogt }, description: { present: mt_ogd !== "none", match: mt_ogd } },
          twitter: { title: { present: mt_twt !== "none", match: mt_twt }, description: { present: mt_twd !== "none", match: mt_twd } },
          score,
          suggestions: [],
        };
        const legacy_score = (mt_ogt !== "none" ? 2 : 0) + (mt_ogd !== "none" ? 1 : 0) + (mt_twt !== "none" ? 2 : 0) + (mt_twd !== "none" ? 1 : 0);
        kwRel.keywords.push({ kw, in_og_title: mt_ogt !== "none", in_og_description: mt_ogd !== "none", in_tw_title: mt_twt !== "none", in_tw_description: mt_twd !== "none", kw_score: legacy_score });
        kwRel.score += legacy_score;
      }
      kwRel.overall_score = Math.round(perScores.reduce((a, b) => a + b, 0) / Math.max(1, perScores.length));
    }

    const suggestions: Array<Record<string, any>> = [];
    if (ogStatus !== "green") suggestions.push({ prioridad: "Media", categoria: "Social", tarea: "Completar og:title/og:description/og:image.", impacto: "Medio", esfuerzo: "Bajo" });
    const twCard = (tw["twitter:card"] || "").toLowerCase();
    if (twStatus !== "green" || !["summary", "summary_large_image"].includes(twCard)) suggestions.push({ prioridad: "Media", categoria: "Social", tarea: "Definir Twitter Card (summary|summary_large_image).", impacto: "Medio", esfuerzo: "Bajo", nota: `twitter:card: ${twCard || 'no definido'}` });

    return {
      status: "ok",
      error: null,
      url,
      og: { ...og, status: ogStatus },
      twitter: { ...tw, status: twStatus },
      preview_image: preview,
      keyword_relevance: kwRel,
      suggestions,
    };
  } catch (err) {
    return {
      status: "error",
      error: String(err),
      url,
      og: { status: "red" },
      twitter: { status: "red" },
      preview_image: "",
      keyword_relevance: { keywords: [], score: 0, by_keyword: {}, overall_score: 0 },
      suggestions: [
        { prioridad: "Media", categoria: "Social", tarea: "No se pudo recuperar la página para OG/Twitter.", impacto: "Medio", esfuerzo: "Bajo" },
      ],
    } as SocialResult;
  }
}

export async function fetchSerp(
  targetUrl: string,
  keywords: string[],
  lang = "es",
  country = "ES",
  depth = 10,
): Promise<SerpRow[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return [];
  const out: SerpRow[] = [];
  for (const kw of keywords) {
    const params = new URLSearchParams({ engine: "google", q: kw, num: String(depth), api_key: apiKey, safe: "off", hl: lang, gl: country });
    try {
      const r = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      if (!r.ok) continue;
      const data = await r.json() as any;
      const org = (data.organic_results || []) as any[];
      let foundExact: any | undefined;
      let foundDomain: any | undefined;
      const target = new URL(targetUrl);
      for (const it of org) {
        const link = it.link || it.url || "";
        if (!link) continue;
        const u = new URL(link);
        if (u.href.replace(/[#?].*$/, "") === target.href.replace(/[#?].*$/, "")) { foundExact = it; break; }
      }
      if (!foundExact) {
        for (const it of org) {
          const link = it.link || it.url || "";
          if (!link) continue;
          const u = new URL(link);
          if (u.host.replace(/^www\./, "") === target.host.replace(/^www\./, "")) { foundDomain = it; break; }
        }
      }
      const row: SerpRow = foundExact ? {
        keyword: kw, status: "found_exact", position: Number(foundExact.position ?? 0), found_url: foundExact.link || foundExact.url || "", title: foundExact.title || "", lang, country, depth, timestamp: new Date().toISOString(), target_url: targetUrl,
      } : foundDomain ? {
        keyword: kw, status: "found_same_domain", position: Number(foundDomain.position ?? 0), found_url: foundDomain.link || foundDomain.url || "", title: foundDomain.title || "", lang, country, depth, timestamp: new Date().toISOString(), target_url: targetUrl,
      } : {
        keyword: kw, status: "not_found_topN", position: null, found_url: "", title: "", lang, country, depth, timestamp: new Date().toISOString(), target_url: targetUrl,
      };
      out.push(row);
    } catch {
      // ignore this keyword
    }
  }
  return out;
}

export function computeScores(parts: {
  seo_meta?: SeoMetaResult;
  crawl_indexability?: CrawlIndexabilityResult;
  performance?: PerformanceResult;
  social?: SocialResult;
}): { onpage?: number; indexability?: number; wpo?: number; social?: number; overall?: number } {
  const onpage = parts.seo_meta?.keyword_relevance?.overall_score;
  const indexability = (() => {
    const cs = parts.crawl_indexability?.chain_status;
    if (!cs) return undefined;
    return cs === "green" ? 90 : cs === "amber" ? 70 : 40;
  })();
  const wpo = (() => {
    const t = parts.performance?.ttfb_status;
    if (!t) return undefined;
    return t === "green" ? 85 : t === "amber" ? 65 : 40;
  })();
  const social = parts.social?.keyword_relevance?.overall_score;
  const values = [onpage, indexability, wpo, social].filter((v): v is number => typeof v === "number");
  const overall = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : undefined;
  return { onpage, indexability, wpo, social, overall };
}

export async function generateExecutiveSummary(result: AuditFullResult): Promise<{ html?: string; markdown?: string } | undefined> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return undefined;

  // Build a compact, deterministic prompt (avoid leaking full HTML)
  const scores = result.scores || {};
  const brief = {
    scores,
    seo_meta: result.seo_meta ? {
      title_status: result.seo_meta.title.status,
      desc_status: result.seo_meta.description.status,
      robots_status: result.seo_meta.robots_meta.status,
      canonical_abs: result.seo_meta.canonical.absolute,
      h1_count: result.seo_meta.headings_top.h1.length,
      kw_overall: result.seo_meta.keyword_relevance?.overall_score ?? 0,
    } : undefined,
    crawl: result.crawl_indexability ? {
      chain_status: result.crawl_indexability.chain_status,
      final_status: result.crawl_indexability.final_status,
      robots_ok: result.crawl_indexability.robots_info?.ok || false,
      sitemap_ok: result.crawl_indexability.sitemap_info?.ok || false,
      xrobots: result.crawl_indexability.x_robots_tag || "",
    } : undefined,
    wpo: result.performance ? {
      ttfb_ms: result.performance.ttfb_ms,
      ttfb_status: result.performance.ttfb_status,
      compression: result.performance.compression?.value || false,
      cache: result.performance.cache_control?.value || "",
    } : undefined,
    social: result.social ? {
      og_ok: result.social.og?.status === "green",
      tw_ok: result.social.twitter?.status === "green",
      kw_overall: result.social.keyword_relevance?.overall_score ?? 0,
    } : undefined,
  };

  const system = "Eres un analista SEO senior. Entregas resúmenes ejecutivos claros, con KPIs, riesgos y 5-8 acciones priorizadas.";
  const user = `Genera un resumen ejecutivo HTML minimal (sin estilos en línea extensos) con:
- Encabezado con Overall y KPIs (On‑Page, Indexabilidad, WPO, Social)
- 3 hallazgos clave y su impacto
- 5–8 acciones priorizadas (Alta/Media/Baja) con impacto y esfuerzo
Datos:
${JSON.stringify(brief)}`;

  const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 700,
      }),
    });
    if (!r.ok) return undefined;
    const data = (await r.json()) as any;
    const html = data?.choices?.[0]?.message?.content?.trim();
    if (!html) return undefined;
    return { html };
  } catch {
    return undefined;
  }
}
