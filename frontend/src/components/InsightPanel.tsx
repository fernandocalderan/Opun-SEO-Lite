"use client";

type Insight = {
  title: string;
  context: string;
  recommendation: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
};

const severityStyles: Record<Insight["severity"], string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function InsightPanel({ items }: { items: Insight[] }) {
  if (!items.length) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 text-sm text-text-muted shadow-soft">
        <div className="space-y-2 text-center">
          <h3 className="text-base font-semibold text-text-heading">
            No hay recomendaciones activas
          </h3>
          <p className="leading-relaxed">
            Publica auditorias o conecta tus fuentes de reputacion para recibir
            insights priorizados automaticamente.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {items.map((item) => (
        <article
          key={`${item.source}-${item.title}`}
          className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-text-muted">
                {item.source}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-text-heading">
                {item.title}
              </h3>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles[item.severity]}`}
            >
              {item.severity.toUpperCase()}
            </span>
          </header>
          <p className="mt-3 text-sm leading-relaxed text-text-body">
            {item.context}
          </p>
          <p className="mt-4 rounded-xl bg-surface-alt p-4 text-sm text-text-body">
            <span className="font-medium text-text-heading">Recomendacion:</span>{" "}
            {item.recommendation}
          </p>
        </article>
      ))}
    </section>
  );
}
