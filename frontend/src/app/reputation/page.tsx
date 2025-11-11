"use client";

import { useEffect, useState } from "react";
import { ChannelBreakdown } from "@/modules/reputation/ChannelBreakdown";
import { MentionsTable } from "@/modules/reputation/MentionsTable";
import { SentimentTimeline } from "@/modules/reputation/SentimentTimeline";
import { KpiCard } from "@/components/KpiCard";
import { useReputationChannels, useReputationMentions, useReputationSummary, useReputationTimeline } from "@/modules/reputation/hooks";
import { fetchKeywordRanks, type RankRow } from "@/lib/gateways/reputation";
import { KeywordRankTable } from "@/modules/reputation/KeywordRankTable";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects, type Project } from "@/lib/gateways/projects";

export default function ReputationPage() {
  const summary = useReputationSummary();
  const timeline = useReputationTimeline();
  const channels = useReputationChannels();
  const mentions = useReputationMentions();
  const searchParams = useSearchParams();

  const [domain, setDomain] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ranks, setRanks] = useState<RankRow[]>([]);
  const [loadingRanks, setLoadingRanks] = useState(false);
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });

  useEffect(() => {
    const url = searchParams.get("url") || "";
    const kw = searchParams.get("keywords") || "";
    if (url) setDomain(url);
    if (kw) setKeywords(kw);
    if (url && kw) {
      void handleAnalyze(url, kw);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async (d?: string, kwStr?: string) => {
    const dom = (d ?? domain).trim();
    const kws = (kwStr ?? keywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    setLoadingRanks(true);
    try {
      const res = await fetchKeywordRanks(dom, kws);
      setRanks(res);
    } finally {
      setLoadingRanks(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          Reputation Watch
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">
          Monitoreo y mitigacion en vivo
        </h1>
        <p className="text-sm text-text-body">
          Consolida menciones, alertas ORM y accionables coordinados con el equipo de PR.
        </p>
  </header>

  <section className="grid gap-5 md:grid-cols-3">
    {(summary.data ?? []).map((kpi) => (
      <KpiCard key={kpi.label} {...kpi} />
    ))}
  </section>

  <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
    <header className="space-y-1">
      <h2 className="text-lg font-semibold text-text-heading">Ranking de keywords (búsqueda rápida)</h2>
      <p className="text-xs text-text-muted">Añade o quita keywords para ver su posicionamiento actual.</p>
    </header>
    <form
      className="flex flex-wrap items-center gap-3 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        void handleAnalyze();
      }}
    >
      <select
        className="w-64 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        value=""
        onChange={(e) => {
          const id = e.target.value;
          const proj = (projectsQuery.data ?? []).find((p: Project) => p.id === id);
          if (proj) {
            setDomain(proj.primary_url);
            setKeywords((proj.keywords || []).join(", "));
          }
        }}
      >
        <option value="">Seleccionar registro guardado...</option>
        {(projectsQuery.data ?? []).map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Dominio o URL principal (https://...)"
        className="min-w-64 flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand-primary"
      />
      <input
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="keywords separadas por coma"
        className="min-w-64 flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand-primary"
      />
      <button type="submit" className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white">Analizar reputación</button>
    </form>

    {loadingRanks ? (
      <div className="text-xs text-text-muted">Analizando posiciones…</div>
    ) : ranks.length ? (
      <p className="text-xs text-text-muted">Dominio analizado: <span className="font-medium text-text-heading">{domain || "—"}</span></p>
    ) : null}

    <KeywordRankTable rows={ranks} />
  </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <SentimentTimeline data={timeline.data ?? []} />
        <ChannelBreakdown channels={channels.data ?? []} />
      </section>

      <MentionsTable mentions={mentions.data ?? []} />
    </div>
  );
}
