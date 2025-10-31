"use client";

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
  neutral: "text-slate-500",
  negativo: "text-rose-600",
};

export function MentionsTable({ mentions }: { mentions: Mention[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Menciones recientes priorizadas
        </h2>
        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100">
          Exportar CSV
        </button>
      </header>
      <div className="mt-4 space-y-3">
        {mentions.map((mention) => (
          <article
            key={mention.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner"
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
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{mention.reach} alcance estimado</span>
                <span>{mention.publishedAt}</span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {mention.snippet}
            </p>
            <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600">
              {mention.action}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
