"use client";

type Alert = {
  id: string;
  channel: string;
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  publishedAt: string;
  url: string;
};

const sentimentBadge: Record<Alert["sentiment"], string> = {
  positive: "bg-emerald-50 text-emerald-600 border-emerald-200",
  neutral: "bg-zinc-100 text-zinc-600 border-zinc-300",
  negative: "bg-rose-50 text-rose-600 border-rose-200",
};

export function ReputationAlerts({ alerts }: { alerts: Alert[] }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Alertas de reputacion
        </h2>
        <span className="text-sm text-zinc-500">
          {alerts.length} menciones nuevas
        </span>
      </header>
      <ul className="mt-4 space-y-4">
        {alerts.map((alert) => (
          <li key={alert.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-zinc-900">
                {alert.channel}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sentimentBadge[alert.sentiment]}`}
              >
                {alert.sentiment.toUpperCase()}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              {alert.summary}
            </p>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{alert.publishedAt}</span>
              <a
                className="font-medium text-indigo-500 hover:text-indigo-600"
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
