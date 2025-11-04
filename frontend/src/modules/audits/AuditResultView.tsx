"use client";

import { useMemo } from "react";
import type { AuditFullResult } from "@/lib/gateways/audits";

type Props = { result: AuditFullResult };

export function AuditResultView({ result }: Props) {
  const scores = result.scores || {};
  const suggestions = useMemo(() => collectSuggestions(result), [result]);

  return (
    <div className="space-y-6">
      {result.executive_summary?.html ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-heading">Resumen ejecutivo</h4>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: result.executive_summary.html }} />
        </section>
      ) : null}
      {/* Scores */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-heading">Scores</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreBox label="On‑Page" value={scores.onpage} />
          <ScoreBox label="Indexabilidad" value={scores.indexability} />
          <ScoreBox label="Rendimiento" value={scores.wpo} />
          <ScoreBox label="Social" value={scores.social} />
        </div>
        {typeof scores.overall === "number" ? (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="font-semibold text-text-heading">Overall</span>
            <span className={chipClass(numStatus(scores.overall))}>{scores.overall}/100</span>
          </div>
        ) : null}
      </section>

      {/* On-Page */}
      {result.seo_meta ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-heading">SEO On‑Page</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <KV k="Title" v={`${result.seo_meta.title.value}`} status={result.seo_meta.title.status} />
            <KV k="Meta description" v={`${result.seo_meta.description.value}`} status={result.seo_meta.description.status} />
            <KV k="Meta robots" v={`${result.seo_meta.robots_meta.value || "—"}`} status={result.seo_meta.robots_meta.status} />
            <KV k="Canonical" v={`${result.seo_meta.canonical.value || "—"}`} status={result.seo_meta.canonical.status} />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <List k="H1" items={result.seo_meta.headings_top.h1} />
            <List k="H2" items={result.seo_meta.headings_top.h2} />
          </div>
          {result.seo_meta.keyword_relevance && hasKeys(result.seo_meta.keyword_relevance.by_keyword) ? (
            <div className="mt-4 overflow-auto rounded-lg border border-border">
              <table className="min-w-[720px] text-sm">
                <thead className="bg-surface-subtle text-left text-xs font-semibold text-text-muted">
                  <tr>
                    <th className="px-3 py-2">Keyword</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">H1</th>
                    <th className="px-3 py-2">H2</th>
                    <th className="px-3 py-2">Slug</th>
                    <th className="px-3 py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(result.seo_meta.keyword_relevance.by_keyword as Record<string, any>).map(([kw, d]) => (
                    <tr key={kw}>
                      <td className="px-3 py-2 font-medium text-text-heading">{kw}</td>
                      <td className="px-3 py-2"><MatchBadge v={d.title?.match} /></td>
                      <td className="px-3 py-2"><MatchBadge v={d.meta_description?.match} /></td>
                      <td className="px-3 py-2"><MatchBadge v={d.h1?.match} /></td>
                      <td className="px-3 py-2"><MatchBadge v={d.h2?.match} /></td>
                      <td className="px-3 py-2"><MatchBadge v={d.url_slug?.match} /></td>
                      <td className="px-3 py-2 text-right font-semibold">{d.score ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Crawl */}
      {result.crawl_indexability ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-heading">Indexabilidad</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <KV k="Estado final" v={`${result.crawl_indexability.final_status ?? "—"}`} />
            <KV k="Cadena" v={`${result.crawl_indexability.redirect_chain?.length ?? 0} hops`} status={result.crawl_indexability.chain_status} />
            <KV k="X‑Robots‑Tag" v={`${result.crawl_indexability.x_robots_tag || "—"}`} status={result.crawl_indexability.x_robots_tag?.includes("noindex") ? "red" : undefined} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <KV k="robots.txt" v={`${result.crawl_indexability.robots_info?.final_url || result.crawl_indexability.robots_info?.declared || "—"}`} status={result.crawl_indexability.robots_info?.ok ? "green" : "red"} />
            <KV k="sitemap" v={`${result.crawl_indexability.sitemap_info?.final_url || result.crawl_indexability.sitemap_info?.declared || "—"}`} status={result.crawl_indexability.sitemap_info?.ok ? "green" : "amber"} />
          </div>
        </section>
      ) : null}

      {/* Performance */}
      {result.performance ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-heading">Rendimiento</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <KV k="TTFB" v={`${result.performance.ttfb_ms ?? "—"} ms`} status={result.performance.ttfb_status} />
            <KV k="HTML" v={`${formatBytes(result.performance.html_size_bytes || 0)}`} />
            <KV k="Contenido" v={`${result.performance.num_images ?? 0} imágenes · ${result.performance.num_links ?? 0} enlaces`} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <KV k="Compresión" v={result.performance.compression?.value ? "Sí" : "No"} status={result.performance.compression?.status} />
            <KV k="Cache‑Control" v={`${result.performance.cache_control?.value || "—"}`} status={result.performance.cache_control?.status} />
          </div>
        </section>
      ) : null}

      {/* Social */}
      {result.social ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-heading">Social (OG/Twitter)</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <KV k="OG" v={`${result.social.og?.["og:title"] || "—"}`} status={result.social.og?.status} />
            <KV k="Twitter" v={`${result.social.twitter?.["twitter:title"] || "—"}`} status={result.social.twitter?.status} />
            <KV k="Imagen" v={`${result.social.preview_image || "—"}`} />
          </div>
        </section>
      ) : null}

      {/* SERP */}
      {Array.isArray(result.serp) && result.serp.length ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-heading">SERP</h4>
          <div className="overflow-auto rounded-lg border border-border">
            <table className="min-w-[640px] text-sm">
              <thead className="bg-surface-subtle text-left text-xs font-semibold text-text-muted">
                <tr>
                  <th className="px-3 py-2">Keyword</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Posición</th>
                  <th className="px-3 py-2">URL encontrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.serp.map((r, idx) => (
                  <tr key={`${r.keyword}-${idx}`}>
                    <td className="px-3 py-2 font-medium text-text-heading">{r.keyword}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2">{r.position ?? "—"}</td>
                    <td className="px-3 py-2 text-ellipsis text-xs">
                      <a href={r.found_url} className="text-brand-primary hover:underline" target="_blank" rel="noreferrer">
                        {r.found_url}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Sugerencias */}
      {suggestions.length ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-heading">Tareas priorizadas</h4>
          <ul className="space-y-2">
            {suggestions.slice(0, 12).map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle p-3">
                <span className={`pill ${prioClass(s.prioridad)}`}>{s.prioridad}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-heading">{s.tarea}</div>
                  <div className="text-xs text-text-muted">{s.categoria} · Impacto {s.impacto} · Esfuerzo {s.esfuerzo}{s.nota ? ` · ${s.nota}` : ""}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value?: number }) {
  if (typeof value !== "number") return (
    <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-3 text-sm text-text-muted">{label}: —</div>
  );
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-base font-semibold text-text-heading">
        {value}/100 <span className={chipClass(numStatus(value))}>{statusLabel(numStatus(value))}</span>
      </div>
    </div>
  );
}

function KV({ k, v, status }: { k: string; v: string; status?: "green" | "amber" | "red" }) {
  return (
    <div className="rounded-lg border border-border bg-surface-subtle p-3 text-sm">
      <div className="text-xs text-text-muted">{k}</div>
      <div className="mt-1 flex items-center gap-2 font-medium text-text-heading">
        <span className="truncate">{v || "—"}</span>
        {status ? <span className={chipClass(status)}>{statusLabel(status)}</span> : null}
      </div>
    </div>
  );
}

function List({ k, items }: { k: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface-subtle p-3 text-sm">
      <div className="text-xs text-text-muted">{k}</div>
      <ul className="mt-1 list-inside list-disc space-y-1">
        {(items || []).slice(0, 8).map((t, i) => (
          <li key={i} className="text-text-body">{t}</li>
        ))}
        {(!items || items.length === 0) ? <li className="text-text-muted">—</li> : null}
      </ul>
    </div>
  );
}

function MatchBadge({ v }: { v: string }) {
  const map: any = { exact: ["Exacta", "green"], partial: ["Parcial", "amber"], none: ["Ninguna", "red"] };
  const [label, status] = map[v] || ["—", "red"];
  return <span className={chipClass(status as any)}>{label}</span>;
}

function chipClass(status: "green" | "amber" | "red") {
  const map = {
    green: "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700",
    amber: "inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700",
    red: "inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700",
  } as const;
  return map[status];
}

function numStatus(n: number): "green" | "amber" | "red" {
  if (n >= 85) return "green";
  if (n >= 70) return "amber";
  return "red";
}

function statusLabel(s: string) {
  return s === "green" ? "Bueno" : s === "amber" ? "Mejorable" : "Crítico";
}

function formatBytes(n: number) {
  let v = n; const units = ["B","KB","MB","GB"]; let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${units[i]}`;
}

function collectSuggestions(result: AuditFullResult) {
  const out: any[] = [];
  const push = (arr?: any[]) => { if (Array.isArray(arr)) out.push(...arr); };
  push(result.seo_meta?.suggestions);
  push(result.crawl_indexability?.suggestions);
  push(result.performance?.suggestions);
  push(result.social?.suggestions);
  return out;
}

function hasKeys(obj: any) {
  return obj && typeof obj === "object" && Object.keys(obj).length > 0;
}

function prioClass(p: string) {
  const v = (p || "").toLowerCase();
  if (v.startsWith("alta")) return "pill green";
  if (v.startsWith("media")) return "pill amber";
  return "pill red";
}
