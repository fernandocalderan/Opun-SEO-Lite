import { KpiCard } from "@/components/KpiCard";
import { InsightPanel } from "@/components/InsightPanel";
import { ReputationAlerts } from "@/components/ReputationAlerts";
import {
  keyInsights,
  kpiSummary,
  reputationAlerts,
} from "@/lib/mocks/dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-medium uppercase tracking-widest text-indigo-500">
            Opun Intelligence Suite
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">
            Panel de reputacion y visibilidad
          </h1>
          <p className="max-w-3xl text-sm text-zinc-600">
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
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Estrategia en progreso
                </h2>
                <span className="text-xs text-zinc-400">
                  Ultima actualizacion: hace 2h
                </span>
              </header>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Objetivo Sprint: estabilizar reputacion en foros especializados
                y recuperar 10% de CTR en brand search. El backend debera
                suministrar datos de tendencias y ownership de tareas.
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
