import { KpiCard } from "@/components/KpiCard";
import { InsightPanel } from "@/components/InsightPanel";
import { ReputationAlerts } from "@/components/ReputationAlerts";
import {
  keyInsights,
  kpiSummary,
  overviewNarrative,
  reputationAlerts,
} from "@/lib/mocks";

export default function Home() {
  const narrativeUpdatedAt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(overviewNarrative.updatedAt));

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
          {kpiSummary.map((metric) => (
            <KpiCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-heading">
                  {overviewNarrative.headline}
                </h2>
                <span className="text-xs text-text-muted">
                  Ultima actualizacion: {narrativeUpdatedAt}
                </span>
              </header>
              <p className="mt-3 text-sm leading-relaxed text-text-body">
                {overviewNarrative.summary}
              </p>
            </article>

            <InsightPanel items={keyInsights} />
          </div>
          <ReputationAlerts alerts={reputationAlerts} />
        </section>
      </main>
    </div>
  );
}
