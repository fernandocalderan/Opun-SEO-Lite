"use client";

import { useMemo, useState } from "react";

type Mention = {
  id: string;
  source: string;
  sentiment: "positivo" | "neutral" | "negativo";
  snippet: string;
  publishedAt: string;
  reach: string;
  action: string;
};

const sentimentColor: Record<Mention["sentiment"], string> = {
  positivo: "text-emerald-600",
  neutral: "text-text-body",
  negativo: "text-rose-600",
};

const FILTERS: Array<{ label: string; value: "all" | Mention["sentiment"] }> = [
  { label: "Todos", value: "all" },
  { label: "Positivos", value: "positivo" },
  { label: "Neutros", value: "neutral" },
  { label: "Negativos", value: "negativo" },
];

function toCsv(mentions: Mention[]): string {
  const header = [
    "id",
    "source",
    "sentiment",
    "snippet",
    "published_at",
    "reach",
    "action",
  ];

  const rows = mentions.map((mention) =>
    [
      mention.id,
      mention.source,
      mention.sentiment,
      mention.snippet.replace(/"/g, '""'),
      mention.publishedAt,
      mention.reach,
      mention.action.replace(/"/g, '""'),
    ].map((value) => `"${value}"`).join(","),
  );

  return [header.join(","), ...rows].join("\n");
}

export function MentionsTable({ mentions }: { mentions: Mention[] }) {
  const [sentimentFilter, setSentimentFilter] =
    useState<(typeof FILTERS)[number]["value"]>("all");

  const filteredMentions = useMemo(() => {
    if (sentimentFilter === "all") {
      return mentions;
    }

    return mentions.filter((mention) => mention.sentiment === sentimentFilter);
  }, [mentions, sentimentFilter]);

  const handleExport = () => {
    const csv = toCsv(filteredMentions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `opun_mentions_${sentimentFilter}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-heading">
            Menciones recientes priorizadas
          </h2>
          <p className="text-xs text-text-body">
            Filtra por sentimiento para asignar acciones mas rapido.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-body">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-border px-3 py-1 font-medium transition hover:bg-surface-alt"
          >
            Exportar CSV
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const isActive = sentimentFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSentimentFilter(filter.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                isActive
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                  : "border-border text-text-body hover:bg-surface-alt"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
        <span className="text-xs text-text-muted">
          {filteredMentions.length} resultados
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {filteredMentions.map((mention) => (
          <article
            key={mention.id}
            className="rounded-xl border border-border bg-surface-subtle p-4 shadow-inner"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {mention.source}
                </p>
                <span
                  className={`text-xs font-medium ${sentimentColor[mention.sentiment]}`}
                >
                  {mention.sentiment.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>{mention.reach} alcance estimado</span>
                <span>{mention.publishedAt}</span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-body">
              {mention.snippet}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="rounded-lg bg-surface px-3 py-2 text-xs font-medium text-text-body">
                {mention.action}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    void navigator.clipboard.writeText(mention.action);
                  }
                }}
                className="text-xs font-medium text-indigo-500 transition hover:text-indigo-600"
              >
                Copiar accion
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
