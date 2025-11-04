"use client";

type Alert = {
  id: string;
  channel: string;
  source: string;
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  publishedAt: string;
  url: string;
};

const sentimentBadge: Record<Alert["sentiment"], string> = {
  positive: "bg-emerald-50 text-emerald-600 border-emerald-200",
  neutral: "bg-surface-alt text-text-body border-zinc-300",
  negative: "bg-rose-50 text-rose-600 border-rose-200",
};

export function ReputationAlerts({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-5 text-sm text-text-muted shadow-soft">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-heading">
            Alertas de reputacion
          </h2>
          <span className="text-sm text-text-muted">0 menciones nuevas</span>
        </header>
        <div className="mt-6 space-y-2 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-medium text-text-heading">
            Sin alertas en las ultimas horas
          </p>
          <p className="text-sm leading-relaxed">
            Configura reglas de monitoreo y conectores externos para catalogar
            menciones y riesgos reputacionales en tiempo real.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-heading">
          Alertas de reputacion
        </h2>
        <span className="text-sm text-text-muted">
          {alerts.length} menciones nuevas
        </span>
      </header>
      <ul className="mt-4 space-y-4">
        {alerts.map((alert) => (
          <li key={alert.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-text-heading">
                {alert.channel}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sentimentBadge[alert.sentiment]}`}
              >
                {alert.sentiment.toUpperCase()}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-text-body">
              {alert.summary}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
              <span className="font-medium text-text-heading">
                {alert.source}
              </span>
              <span>{alert.publishedAt}</span>
              <a
                className="font-medium text-brand-primary hover:text-brand-secondary"
                href={alert.url}
                target="_blank"
                rel="noreferrer"
              >
                Ver detalle
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
