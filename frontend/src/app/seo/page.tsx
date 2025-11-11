"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects, type Project } from "@/lib/gateways/projects";
import { useAuditHistory } from "@/modules/audits/hooks";
import { AuditHistory } from "@/modules/audits/AuditHistory";
import { AuditResultView } from "@/modules/audits/AuditResultView";
import { fetchAuditResult, type AuditFullResult } from "@/lib/gateways/audits";
import { createAuditHistoryFallback } from "@/lib/gateways";
import { auditResultSample } from "@/lib/mocks/auditResult.sample";
import { fetchKeywordRanks, type RankRow } from "@/lib/gateways/reputation";
import { KeywordRankTable } from "@/modules/reputation/KeywordRankTable";

export default function SeoAnalysisPage() {
  const history = useAuditHistory();
  const searchParams = useSearchParams();
  const fallback = useMemo(() => createAuditHistoryFallback(), []);
  const pages = (history.data?.pages ?? [fallback]);
  const items = pages.flatMap((p) => p.items);
  const initialId = searchParams.get("id") || items[0]?.id || null;
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [urlInput, setUrlInput] = useState<string>("");
  const [kwInput, setKwInput] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [content, setContent] = useState<AuditFullResult | { status: "pending" } | { status: "failed"; reason?: string } | null>(null);
  const [demo, setDemo] = useState(false);
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });
  const [repRanks, setRepRanks] = useState<RankRow[]>([]);
  const [loadingRep, setLoadingRep] = useState(false);

  useEffect(() => {
    // Si cambia el query param id o la lista, sincronizar selección inicial
    const qp = searchParams.get("id");
    if (qp) {
      setSelectedId(qp);
      return;
    }
    // Si el seleccionado no existe en la lista actual (p.ej. fallback 'hist-1'), seleccionar el primero real
    const idSet = new Set(items.map((i) => i.id));
    if (!selectedId || !idSet.has(selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchParams]);

  const submitQuickSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSelectedId(null);
    setCurrentUrl(urlInput.trim());
    setContent(auditResultSample);
    setDemo(true);
    const kwList = (kwInput || "").split(",").map((k) => k.trim()).filter(Boolean);
    setLoadingRep(true);
    void fetchKeywordRanks(urlInput.trim(), kwList)
      .then(setRepRanks)
      .catch(() => setRepRanks([]))
      .finally(() => setLoadingRep(false));
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!selectedId) return;
      setContent(null);
      const res = await fetchAuditResult(selectedId);
      if (!active) return;
      if (res) {
        setContent(res);
        setDemo(false);
        // si aún está pendiente, reintentar después de 2s
        if ("status" in res && res.status === "pending") {
          setTimeout(() => {
            if (!active) return;
            // fuerza un re-fetch cambiando temporalmente el estado
            setContent(null);
            fetchAuditResult(selectedId)
              .then((r) => {
                if (!active || !r) return;
                setContent(r);
              })
              .catch(() => {});
          }, 2000);
        }
      } else {
        // Sin API: mostrar demo para trabajar diseño/flujo
        setContent(auditResultSample);
        setDemo(true);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [selectedId]);

  return (
    <div className="space-y-6 p-8">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-brand-primary">
          SEO Analysis
        </span>
        <h1 className="text-3xl font-semibold text-text-heading">Resultado de auditoria</h1>
        <p className="text-sm text-text-body">
          Explora el resultado completo por secciones. Elige una ejecución del historial o lanza un análisis rápido.
        </p>
        {currentUrl ? (
          <p className="text-xs text-text-muted">URL analizada: <span className="font-medium text-text-heading">{currentUrl}</span></p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <form className="flex flex-wrap items-center gap-3 text-sm" onSubmit={submitQuickSeo}>
          <select
            className="w-64 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            value=""
            onChange={(e) => {
              const id = e.target.value;
              const proj = (projectsQuery.data ?? []).find((p: Project) => p.id === id);
              if (proj) {
                setUrlInput(proj.primary_url);
                setKwInput((proj.keywords || []).join(", "));
              }
            }}
          >
            <option value="">Seleccionar registro guardado...</option>
            {(projectsQuery.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="URL o dominio (https://...)"
            className="min-w-64 flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand-primary"
          />
          <input
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            placeholder="keywords (opcional, separadas por coma)"
            className="min-w-64 flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand-primary"
          />
          <button type="submit" className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white">Analizar SEO</button>
          {urlInput ? (
            <a
              href={`/reputation?url=${encodeURIComponent(urlInput)}${kwInput ? `&keywords=${encodeURIComponent(kwInput)}` : ""}`}
              className="rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
            >
              Ver reputación para esta URL
            </a>
          ) : null}
        </form>
      </section>

      {loadingRep ? (
        <section className="space-y-3 rounded-2xl border border-border bg-surface p-5"><p className="text-xs text-text-muted">Analizando reputación…</p></section>
      ) : repRanks.length ? (
        <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
          <header className="space-y-1">
            <h2 className="text-lg font-semibold text-text-heading">Reputación (búsqueda rápida)</h2>
            <p className="text-xs text-text-muted">Posicionamiento actual para las keywords proporcionadas.</p>
          </header>
          <KeywordRankTable rows={repRanks} />
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr,2fr]">
        <div className="space-y-4">
          <AuditHistory
            items={items}
            total={pages[0]?.total ?? items.length}
            onRefresh={() => void history.refetch()}
            isLoading={history.isLoading}
            hasMore={Boolean(history.hasNextPage)}
            onLoadMore={history.hasNextPage ? () => history.fetchNextPage() : undefined}
            isLoadingMore={history.isFetchingNextPage}
            onViewResult={(id) => setSelectedId(id)}
          />
        </div>
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-heading">
              {selectedId ? `Ejecucion ${selectedId}` : "Selecciona una ejecucion"}
            </h2>
            {demo ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Modo demo (sin API)
              </span>
            ) : null}
          </header>
          {content ? (
            "status" in content && content.status === "pending" ? (
              <p className="text-sm text-text-muted">El resultado aún no está listo. Intentando nuevamente...</p>
            ) : "status" in content && content.status === "failed" ? (
              <FailedResultState auditId={selectedId} reason={content.reason} onRetry={() => {
                if (!selectedId) return;
                setContent(null);
                void fetchAuditResult(selectedId).then(setContent).catch(() => {});
              }} />
            ) : (
              <AuditResultView result={content as AuditFullResult} />
            )
          ) : (
            <p className="text-sm text-text-muted">Cargando...</p>
          )}
        </section>
      </div>
    </div>
  );
}

function FailedResultState({ auditId, reason, onRetry }: { auditId: string | null; reason?: string; onRetry: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <p className="font-semibold text-rose-800">La auditoría {auditId ?? "seleccionada"} falló</p>
      <p className="leading-relaxed">{reason ? `Motivo: ${reason}` : "Ocurrió un error durante la ejecución."}</p>
      <div className="flex items-center gap-2">
        <button onClick={onRetry} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">Reintentar carga</button>
        <a href="/audits" className="rounded-full border border-rose-600 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100">Lanzar una nueva auditoría</a>
      </div>
    </div>
  );
}
