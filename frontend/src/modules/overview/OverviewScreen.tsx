"use client";

import { useMemo } from "react";
import { KpiCard } from "@/components/KpiCard";
import { InsightPanel } from "@/components/InsightPanel";
import { ReputationAlerts } from "@/components/ReputationAlerts";
import { useOverviewQuery } from "./hooks";

export function OverviewScreen() {
  const { data, isLoading, isError, refetch } = useOverviewQuery();
  const narrativeUpdatedAt = data?.narrative.updatedAt;
  const narrativeUpdatedAtLabel = useMemo(() => {
    if (!narrativeUpdatedAt) {
      return null;
    }
    try {
      return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(narrativeUpdatedAt));
    } catch {
      return narrativeUpdatedAt;
    }
  }, [narrativeUpdatedAt]);

  if (isLoading && !data) {
    return <OverviewLoadingState />;
  }

  if (isError) {
    return <OverviewErrorState onRetry={() => void refetch()} />;
  }

  if (!data) {
    return <OverviewEmptyState />;
  }

  return (
    <div className="min-h-screen bg-surface-subtle text-text-body">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-medium uppercase tracking-[var(--tracking-wide)] text-brand-primary">
            Opun Intelligence Suite
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-text-heading">
            Panel de reputacion y visibilidad
          </h1>
          <p className="max-w-3xl text-sm text-text-body">
            Seguimiento centralizado de salud SEO, riesgos ORM y oportunidades
            de amplificacion. Datos mock para guiar el desarrollo del nuevo
            frontend.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {data.kpis.length ? (
            data.kpis.map((metric) => <KpiCard key={metric.label} {...metric} />)
          ) : (
            <EmptyKpiState />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-heading">
                  {data.narrative.headline}
                </h2>
                <span className="text-xs text-text-muted">
                  Ultima actualizacion: {narrativeUpdatedAtLabel ?? "—"}
                </span>
              </header>
              <p className="mt-3 text-sm leading-relaxed text-text-body">
                {data.narrative.summary}
              </p>
            </article>

            <InsightPanel items={data.insights} />
          </div>
          <ReputationAlerts alerts={data.alerts} />
        </section>
      </main>
    </div>
  );
}

function OverviewLoadingState() {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <div className="space-y-3">
          <div className="h-3 w-52 rounded-full bg-surface-alt" />
          <div className="h-9 w-80 rounded-full bg-surface-alt" />
          <div className="h-10 max-w-3xl rounded-2xl bg-surface-alt" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-2xl border border-border bg-surface p-5 shadow-soft"
            >
              <div className="h-full w-full animate-pulse rounded-xl bg-surface-alt" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="h-40 rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="h-full w-full animate-pulse rounded-xl bg-surface-alt" />
            </div>
            <div className="h-64 rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="h-full w-full animate-pulse rounded-xl bg-surface-alt" />
            </div>
          </div>
          <div className="h-64 rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="h-full w-full animate-pulse rounded-xl bg-surface-alt" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewEmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-6 py-10 text-center text-text-muted">
      <div className="max-w-md space-y-3 rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <h2 className="text-lg font-semibold text-text-heading">
          Aun no hay datos disponibles
        </h2>
        <p className="text-sm leading-relaxed">
          Configura las integraciones de reputacion y SEO para comenzar a ver los
          indicadores clave y alertas priorizadas.
        </p>
      </div>
    </div>
  );
}

function OverviewErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-6 py-10 text-center text-text-muted">
      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <h2 className="text-lg font-semibold text-text-heading">
          No se pudo cargar la vista Overview
        </h2>
        <p className="text-sm leading-relaxed">
          Hubo un problema al obtener los datos. Intenta recargar la pagina o
          verificar tu conexion.
        </p>
        <button
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
          onClick={onRetry}
          type="button"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

function EmptyKpiState() {
  return (
    <div className="md:col-span-3">
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-alt p-10 text-center text-sm text-text-muted">
        <p className="text-base font-semibold text-text-heading">
          No hay KPIs configurados
        </p>
        <p>
          Define tus indicadores clave en Settings para visualizar la salud SEO y
          reputacional en esta seccion.
        </p>
      </div>
    </div>
  );
}
